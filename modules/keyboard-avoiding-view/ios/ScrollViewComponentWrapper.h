#import <UIKit/UIKit.h>

@interface ScrollViewComponentWrapper : NSObject

@property(nullable, nonatomic, readonly) UIView *view;

- (nullable instancetype)initWithView:(nonnull UIView *)view;
- (void)setInsetsFromKeyboardHeight:(CGFloat)keyboardHeight;

@end
