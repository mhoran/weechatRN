#import <Foundation/Foundation.h>
#import <React/RCTView.h>

@interface ScrollViewWrapper : NSObject

- (instancetype)initWithView:(UIView *)view;
- (void)setInsetsFromKeyboardHeight:(CGFloat)keyboardHeight;
- (UIView *)view;

@end
