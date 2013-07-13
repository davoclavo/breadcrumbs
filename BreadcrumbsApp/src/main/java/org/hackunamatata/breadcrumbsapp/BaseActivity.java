package org.hackunamatata.breadcrumbsapp;

import android.app.Activity;

import com.firebase.client.Firebase;

/**
 * Created by vic on 7/13/13.
 */
public class BaseActivity extends Activity {

    private static final String FIREBASE_URL = "https://breadcr";

    public Firebase getFirebase() {
        return new Firebase(FIREBASE_URL);
    }

}
