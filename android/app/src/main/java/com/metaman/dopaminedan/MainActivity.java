package com.metaman.dopaminedan;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onResume() {
      super.onResume();
      // Bypasses the user gesture requirement for media playback (audio/video) on Android WebView
      if (this.bridge != null && this.bridge.getWebView() != null) {
        this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
      }
    }
}
