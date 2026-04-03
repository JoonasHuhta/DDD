package com.metaman.dopaminedan;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Apply setting early. Note: Bridge might be fully ready slightly after super.onCreate
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        }
    }

    @Override
    public void onResume() {
      super.onResume();
      // Bypasses the user gesture requirement for media playback (audio/video) on Android WebView
      if (this.bridge != null && this.bridge.getWebView() != null) {
        this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
      }
    }
}
