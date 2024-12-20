new_arch_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

Pod::Spec.new do |s|
  s.name           = 'KeyboardAvoidingView'
  s.version        = '1.0.0'
  s.summary        = 'KeyboardAvoidingView using UIKit Keyboard Layout Guide'
  s.author         = { 'Matt Horan' => 'matt@matthoran.com' }
  s.homepage       = 'https://github.com/mhoran/weechatRN/'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: 'https://github.com/mhoran/weechatRN.git' }
  s.license        = { type: 'MIT' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'OTHER_SWIFT_FLAGS' => "$(inherited) #{new_arch_enabled ? '-DRCT_NEW_ARCH_ENABLED' : ''}",
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
