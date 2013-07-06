package org.hackunamatata.breadcrumbsapp;

import com.firebase.client.Firebase;

/**
 * Created by vic on 7/6/13.
 */
public class Application extends android.app.Application {

    private Firebase firebase;

    private static final String FIREBASE_ROOT = "https://breadcrumbs.firebaseio.com/";

    public Application() {
        super();
        firebase = new Firebase(FIREBASE_ROOT);
    }

    public Firebase getFirebase() {
        return firebase;
    }

}
