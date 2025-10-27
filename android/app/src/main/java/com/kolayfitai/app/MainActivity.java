package com.kolayfitai.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "Registering GoogleAuth plugin");
        registerPlugin(GoogleAuth.class);
        super.onCreate(savedInstanceState);
        Log.d(TAG, "MainActivity onCreate completed");
    }
}
