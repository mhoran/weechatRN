#import <UIKit/UIKit.h>

@interface FabricViewWrapper : NSObject

@property(nullable, nonatomic, readonly) NSString *nativeId;

- (nullable instancetype)initWithView:(nonnull UIView *)view;

@end
