#import "FabricViewWrapper.h"
#import <React/RCTViewComponentView.h>

@interface FabricViewWrapper ()

@property(nullable, nonatomic, weak) RCTViewComponentView *componentView;

@end

@implementation FabricViewWrapper

- (nullable instancetype)initWithView:(UIView *)view {
  if (![view isKindOfClass:[RCTViewComponentView class]]) {
    return nil;
  }

  self = [super init];
  self.componentView = (RCTViewComponentView *)view;
  return self;
}

- (nullable NSString *)nativeId {
  if (!self.componentView) {
    return nil;
  }
  
  return self.componentView.nativeId;
}

@end
