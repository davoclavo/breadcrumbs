package org.hackunamatata.breadcrumbsapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.View;

public class MainActivity extends BaseActivity {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    public void goToCreateTrail(View v){
        Intent i = new Intent(MainActivity.this, TrailActivity.class);
        i.putExtra("isFollower", false);
        startActivity(i);
    }

    public void goToFollowTrail(View v){
        Intent i = new Intent(MainActivity.this, TrailActivity.class);
        i.putExtra("isFollower", true);
        startActivity(i);
    }
    
}
