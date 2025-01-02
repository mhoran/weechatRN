#import <Foundation/Foundation.h>
#import <React/RCTView.h>

@interface ScrollViewWrapper : NSObject

@property(nonatomic, readonly) BOOL isScrollViewPanning;

- (nullable instancetype)initWithView:(nonnull UIView *)view;
- (void)setInsetsFromKeyboardHeight:(CGFloat)keyboardHeight;
- (nullable UIView *)view;

@end
