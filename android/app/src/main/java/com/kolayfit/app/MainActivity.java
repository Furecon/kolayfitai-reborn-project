package com.kolayfit.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Google Auth Plugin'ini kaydet
        registerPlugin(com.kolayfit.app.GoogleAuthPlugin.class);
    }
}