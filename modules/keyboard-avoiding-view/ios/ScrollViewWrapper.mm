#include "ScrollViewWrapper.h"

#ifdef RCT_NEW_ARCH_ENABLED
#include <React/RCTScrollViewComponentView.h>
#define ReactScrollViewBase RCTScrollViewComponentView
#else
#include <React/RCTScrollView.h>
#define ReactScrollViewBase RCTScrollView
#endif

@interface ScrollViewWrapper ()

@property (nonatomic, readwrite, assign) BOOL isScrollViewPanning;

@end

@implementation ScrollViewWrapper {
  __weak ReactScrollViewBase *_scrollView;
}

@synthesize isScrollViewPanning;

- (instancetype)initWithView:(UIView *)view {
  if (![view isKindOfClass:[ReactScrollViewBase class]]) {
    return nil;
  }

  self = [super init];
  _scrollView = (ReactScrollViewBase *)view;
  isScrollViewPanning = false;
  [_scrollView.scrollView.panGestureRecognizer
      addTarget:self
          action:@selector(scrollViewPanned:)];
  return self;
}

- (void)setInsetsFromKeyboardHeight:(CGFloat)keyboardHeight {
  if (!_scrollView) {
    return;
  }

  UIEdgeInsets newEdgeInsets = _scrollView.scrollView.contentInset;
  if ([self isInverted]) {
    newEdgeInsets.bottom = keyboardHeight;
  } else {
    newEdgeInsets.top = keyboardHeight;
  }

  _scrollView.scrollView.contentInset = newEdgeInsets;
  _scrollView.scrollView.scrollIndicatorInsets = newEdgeInsets;
}

- (bool)isInverted {
  // Look into the entry at position 2,2 to check if scaleY is applied
  return _scrollView.layer.transform.m22 == -1;
}

- (nullable UIView *)view {
  return (UIView *)_scrollView;
}

- (void)scrollViewPanned:(UIPanGestureRecognizer *)gesture {
  if (gesture.state == UIGestureRecognizerStateBegan) {
    isScrollViewPanning = YES;
  } else if (gesture.state == UIGestureRecognizerStateEnded) {
    isScrollViewPanning = NO;
  }
}

@end
