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
        Log.d(TAG, "GoogleAuth Plugin loading...");
        
        // Google Sign-In yapılandırması
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("680638175809-ud31fspsid283q4tt7s9etok0nrb9e2g.apps.googleusercontent.com")
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(getActivity(), gso);
        Log.d(TAG, "GoogleAuth Plugin loaded successfully");
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        Log.d(TAG, "signIn method called");
        this.pendingCall = call;
        
        try {
            Intent signInIntent = mGoogleSignInClient.getSignInIntent();
            startActivityForResult(call, signInIntent, RC_SIGN_IN);
            Log.d(TAG, "Google Sign-In intent started");
        } catch (Exception e) {
            Log.e(TAG, "Error starting Google Sign-In: " + e.getMessage());
            JSObject error = new JSObject();
            error.put("error", "Failed to start Google Sign-In: " + e.getMessage());
            call.reject("GOOGLE_SIGNIN_ERROR", error);
        }
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
            Log.d(TAG, "Activity result received for Google Sign-In");
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                Log.d(TAG, "Google Sign-In successful for: " + account.getEmail());
                
                JSObject result = new JSObject();
                result.put("idToken", account.getIdToken());
                result.put("displayName", account.getDisplayName());
                result.put("email", account.getEmail());
                result.put("photoUrl", account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : "");
                
                pendingCall.resolve(result);
                
            } catch (ApiException e) {
                Log.e(TAG, "Google Sign-In failed with code: " + e.getStatusCode() + ", message: " + e.getMessage());
                JSObject error = new JSObject();
                error.put("error", "Google Sign-In failed: " + e.getMessage());
                error.put("statusCode", e.getStatusCode());
                pendingCall.reject("GOOGLE_SIGNIN_FAILED", error);
            }
            
            pendingCall = null;
        }
    }
}