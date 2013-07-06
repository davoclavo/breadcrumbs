package org.hackunamatata.breadcrumbsapp;

import android.app.Activity;

import com.firebase.client.Firebase;

/**
 * Created by vic on 7/6/13.
 */
public class BaseActivity extends Activity {

    public Firebase getFirebase() {
        return ((Application) getApplication()).getFirebase();
    }

}
