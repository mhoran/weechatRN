#import <Foundation/Foundation.h>
#import <React/RCTView.h>

@interface ScrollViewWrapper : NSObject

- (instancetype)initWithView:(UIView *)view;
- (void)setInsetsFromKeyboardHeight:(CGFloat)keyboardHeight;
- (UIView *)view;
- (void)addGestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
    NS_SWIFT_NAME(addGestureRecognizer(_:));

@end
