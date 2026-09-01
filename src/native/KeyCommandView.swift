internal import ExpoModulesCore

class KeyCommandView: ExpoView {
  private var onShiftEnter = EventDispatcher()
  private var onTab = EventDispatcher()

  override var keyCommands: [UIKeyCommand]? {
    let shiftEnterCommand = UIKeyCommand(
      input: "\r",
      modifierFlags: .shift,
      action: #selector(handleShiftEnter(_:))
    )
    shiftEnterCommand.wantsPriorityOverSystemBehavior = true

    let tabCommand = UIKeyCommand(
      input: "\t",
      modifierFlags: [],
      action: #selector(handleTab(_:))
    )
    tabCommand.wantsPriorityOverSystemBehavior = true

    return [shiftEnterCommand, tabCommand]
  }

  @objc func handleShiftEnter(_ sender: UIKeyCommand) {
    onShiftEnter()
  }

  @objc func handleTab(_ sender: UIKeyCommand) {
    onTab()
  }
}
