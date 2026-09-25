package expo.modules.keyboardavoidingview

import android.content.Context
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsAnimationCompat
import androidx.core.view.WindowInsetsCompat
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class KeyboardAvoidingView(context: Context, appContext: AppContext) :
    ExpoView(context, appContext) {
    private var contentView: KeyboardAvoidingContentView? = null
    private var contentHeight: Double? = null
    private var imeBottom = 0
    private var animating = false
    private val location = IntArray(2)

    init {
        clipChildren = true

        ViewCompat.setOnApplyWindowInsetsListener(this) { _, insets ->
            if (!animating) {
                imeBottom = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
                updateContentHeight()
            }
            insets
        }

        ViewCompat.setWindowInsetsAnimationCallback(
            this,
            object : WindowInsetsAnimationCompat.Callback(DISPATCH_MODE_CONTINUE_ON_SUBTREE) {
                override fun onPrepare(animation: WindowInsetsAnimationCompat) {
                    if (animation.typeMask and WindowInsetsCompat.Type.ime() != 0) {
                        animating = true
                    }
                }

                override fun onProgress(
                    insets: WindowInsetsCompat,
                    runningAnimations: MutableList<WindowInsetsAnimationCompat>
                ): WindowInsetsCompat {
                    if (animating) {
                        imeBottom = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
                        updateContentHeight()
                    }
                    return insets
                }

                override fun onEnd(animation: WindowInsetsAnimationCompat) {
                    if (animation.typeMask and WindowInsetsCompat.Type.ime() == 0) {
                        return
                    }
                    animating = false
                    ViewCompat.getRootWindowInsets(this@KeyboardAvoidingView)?.let {
                        imeBottom = it.getInsets(WindowInsetsCompat.Type.ime()).bottom
                    }
                    updateContentHeight()
                }
            }
        )
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        ViewCompat.requestApplyInsets(this)
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        updateContentHeight()
    }

    private fun updateContentHeight() {
        val contentView = contentView ?: return
        if (height <= 0) {
            return
        }

        getLocationInWindow(location)
        val keyboardTop = rootView.height - imeBottom
        val overlap = (location[1] + height - keyboardTop).coerceAtLeast(0)
        val heightPx = (height - overlap).coerceAtLeast(0)

        val height = heightPx / resources.displayMetrics.density.toDouble()
        if (height == contentHeight) {
            return
        }
        contentHeight = height

        contentView.shadowNodeProxy.setStyleSize(null, height)
    }

    override fun onViewAdded(child: View) {
        super.onViewAdded(child)
        if (child is KeyboardAvoidingContentView) {
            contentView = child
            contentHeight = null
            requestLayout()
        }
    }

    override fun onViewRemoved(child: View) {
        super.onViewRemoved(child)
        if (child === contentView) {
            contentView = null
            contentHeight = null
        }
    }
}
