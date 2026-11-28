internal import ExpoModulesCore
import Foundation

private final class Connection {
  let task: URLSessionWebSocketTask
  var requestedCloseCode: Int?
  var failure: Error?

  var id: Int { task.taskIdentifier }

  init(task: URLSessionWebSocketTask) {
    self.task = task
  }
}

final class URLSessionWebSocketModule: Module {
  private var connections: [Int: Connection] = [:]
  private let lock = NSLock()
  private var session: URLSession?
  private let delegateQueue: OperationQueue = {
    let queue = OperationQueue()
    queue.maxConcurrentOperationCount = 1
    return queue
  }()

  public func definition() -> ModuleDefinition {
    Name("URLSessionWebSocket")
    Events("open", "message", "close")

    Function("connect") { (url: URL, protocols: [String]) -> Int in
      let session = self.withLock { () -> URLSession in
        let session = self.session ?? self.makeSession()
        self.session = session
        return session
      }
      let task = session.webSocketTask(with: url, protocols: protocols)
      // SocketRocket max frame payload length is 256 MiB
      task.maximumMessageSize = 256 * 1024 * 1024
      let connection = Connection(task: task)
      self.withLock { self.connections[connection.id] = connection }
      task.resume()
      self.receive(on: connection)
      return connection.id
    }

    Function("sendText") { (id: Int, text: String) in
      guard let connection = self.connection(id) else { return }
      connection.task.send(.string(text)) { [weak self] error in
        if let error { self?.fail(connection, error: error) }
      }
    }

    Function("close") { (id: Int, code: Int, reason: String) in
      guard let connection = self.connection(id) else { return }
      // SocketRocket the code provided, but URLSessionWebSocketTask can only send recognized codes
      let closeCode = URLSessionWebSocketTask.CloseCode(rawValue: code).flatMap { $0 == .invalid ? nil : $0 } ?? .normalClosure
      self.withLock { connection.requestedCloseCode = closeCode.rawValue }
      connection.task.cancel(with: closeCode, reason: reason.isEmpty ? nil : reason.data(using: .utf8))
    }

    OnDestroy {
      self.withLock { self.session }?.invalidateAndCancel()
    }
  }

  private func makeSession() -> URLSession {
    let configuration = URLSessionConfiguration.default
    configuration.protocolClasses = []
    return URLSession(configuration: configuration, delegate: SessionDelegate(module: self), delegateQueue: delegateQueue)
  }

  private func connection(_ id: Int) -> Connection? {
    withLock { connections[id] }
  }

  private func withLock<T>(_ body: () -> T) -> T {
    lock.lock()
    defer { lock.unlock() }
    return body()
  }

  private func receive(on connection: Connection) {
    connection.task.receive { [weak self] result in
      guard let self else { return }
      switch result {
      case .success(.string(let text)):
        self.sendEvent("message", ["id": connection.id, "text": text])
        self.receive(on: connection)
      case .success(.data(let data)):
        self.sendEvent("message", ["id": connection.id, "data": data])
        self.receive(on: connection)
      case .success:
        self.receive(on: connection)
      case .failure(let error):
        self.fail(connection, error: error)
      }
    }
  }

  private func fail(_ connection: Connection, error: Error) {
    let live = withLock { () -> Bool in
      guard connections[connection.id] != nil else { return false }
      if connection.failure == nil { connection.failure = error }
      return true
    }
    let task = connection.task
    guard live, task.state == .running, task.closeCode == .invalid, !Self.isStreamEnd(error) else { return }
    task.cancel()
  }

  // Recursively unwrap error to determine if it is ENOTCONN
  private static func isStreamEnd(_ error: Error) -> Bool {
    let error = error as NSError
    if error.domain == NSPOSIXErrorDomain && error.code == Int(ENOTCONN) { return true }
    return (error.userInfo[NSUnderlyingErrorKey] as? Error).map(isStreamEnd) ?? false
  }

  fileprivate func didOpen(task: URLSessionWebSocketTask) {
    guard let connection = connection(task.taskIdentifier) else { return }
    sendEvent("open", ["id": connection.id])
  }

  fileprivate func didClose(task: URLSessionWebSocketTask, code: URLSessionWebSocketTask.CloseCode, reason: Data?) {
    guard let connection = connection(task.taskIdentifier) else { return }
    finish(connection, code: code.rawValue, reason: Self.reason(reason), clean: true)
  }

  fileprivate func didComplete(task: URLSessionTask, error: Error?) {
    guard let connection = connection(task.taskIdentifier) else { return }
    if let task = task as? URLSessionWebSocketTask, task.closeCode != .invalid {
      finish(connection, code: task.closeCode.rawValue, reason: Self.reason(task.closeReason), clean: true)
      return
    }
    let (requested, failure) = withLock { (connection.requestedCloseCode, connection.failure) }
    if let requested {
      finish(connection, code: requested, reason: "", clean: true)
      return
    }
    let status = (task.response as? HTTPURLResponse)?.statusCode
    if let status, status >= 400 {
      finish(connection, code: 1006, reason: "Received bad response code from server: \(status).", clean: false)
      return
    }
    let cause = failure ?? error
    guard let cause, !Self.isStreamEnd(cause) else {
      // SocketRocket reports a stream end without a close frame as going away
      finish(connection, code: 1001, reason: "Stream end encountered", clean: false)
      return
    }
    finish(connection, code: 1006, reason: cause.localizedDescription, clean: false)
  }

  private static func reason(_ data: Data?) -> String {
    data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
  }

  private func finish(_ connection: Connection, code: Int, reason: String, clean: Bool) {
    guard withLock({ connections.removeValue(forKey: connection.id) }) != nil else { return }
    sendEvent("close", ["id": connection.id, "code": code, "reason": reason, "wasClean": clean])
  }
}

private final class SessionDelegate: NSObject, URLSessionWebSocketDelegate {
  weak var module: URLSessionWebSocketModule?

  init(module: URLSessionWebSocketModule) {
    self.module = module
  }

  func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
    module?.didOpen(task: webSocketTask)
  }

  func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didCloseWith closeCode: URLSessionWebSocketTask.CloseCode, reason: Data?) {
    module?.didClose(task: webSocketTask, code: closeCode, reason: reason)
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    module?.didComplete(task: task, error: error)
  }
}
