package com.kolayfit.app;

import android.content.Intent;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

import com.google.android.gms.auth.api.signin.*;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "GoogleAuth")
public class GoogleAuthPlugin extends Plugin {
    private static final String TAG = "GoogleAuthPlugin";
    private static final int RC_SIGN_IN = 9001;
    private GoogleSignInClient mGoogleSignInClient;
    private PluginCall pendingCall;

    @Override
    public void load() {
        // Google Sign-In yapılandırması
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("YOUR_WEB_CLIENT_ID") // Buraya Google Web Client ID'nizi koyun
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(getActivity(), gso);
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        this.pendingCall = call;
        
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(call, signInIntent, RC_SIGN_IN);
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        mGoogleSignInClient.signOut()
                .addOnCompleteListener(getActivity(), task -> {
                    JSObject result = new JSObject();
                    result.put("success", true);
                    call.resolve(result);
                });
    }

    @PluginMethod
    public void isSignedIn(PluginCall call) {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getContext());
        JSObject result = new JSObject();
        result.put("isSignedIn", account != null);
        call.resolve(result);
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        
        if (requestCode == RC_SIGN_IN && pendingCall != null) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                
                JSObject result = new JSObject();
                result.put("idToken", account.getIdToken());
                result.put("accessToken", account.getServerAuthCode());
                
                pendingCall.resolve(result);
                Log.d(TAG, "Google sign-in successful");
                
            } catch (ApiException e) {
                Log.w(TAG, "Google sign-in failed", e);
                pendingCall.reject("Google sign-in failed: " + e.getStatusCode());
            }
            
            pendingCall = null;
        }
    }
}