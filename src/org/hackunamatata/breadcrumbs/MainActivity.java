package org.hackunamatata.breadcrumbs;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import com.firebase.client.ChildEventListener;
import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.ValueEventListener;
import com.firebase.client.utilities.Base64.InputStream;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapFragment;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;

import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.telephony.TelephonyManager;
import android.util.Patterns;
import android.view.Menu;

public class MainActivity extends Activity {

	static final String FIREBASE = "https://breadcrumbsapp.firebaseio.com/";
	static final LatLng KIEL = new LatLng(53.551, 9.993);
	private GoogleMap map;
	private Marker myMarker;
	private Firebase firebase;
	private Firebase myself;
	private Firebase room;
	private String uuid;
	private String email;

	private Map<String, Avatar> people = new HashMap<String, Avatar>();
	private Map<String, Marker> markers = new HashMap<String, Marker>();
	
	private Avatar myAvatar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        firebase = new Firebase(FIREBASE);
        String roomName = "hackathon";
        
        TelephonyManager tManager = (TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);
        uuid = tManager.getDeviceId();
         
        myself = firebase.child("trails/"+roomName + "/" + uuid);
        Firebase room = new Firebase(FIREBASE+"trails/"+roomName);
       
        map = ((MapFragment) getFragmentManager().findFragmentById(R.id.map)).getMap();
        
              
        LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, locationListener);
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, locationListener);
        
        Location lastPosition = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
        LatLng lastKnown;
        if (lastPosition == null) {
        	lastKnown = KIEL;
        } else {
        	lastKnown = new LatLng(lastPosition.getLatitude(), lastPosition.getLongitude());
        }
         
        email = getEmail();
        
        BitmapDescriptor iconDescriptor = BitmapDescriptorFactory.fromResource(R.drawable.ic_launcher);

        new RetrievePictureTask().execute("http://avatars.io/email/"+email, uuid);
        
        myMarker = map.addMarker(new MarkerOptions()
        .position(lastKnown)
        .title(email)
        .snippet("Kiel is cool")
        .icon(iconDescriptor));

        
	    // Move the camera instantly to hamburg with a zoom of 15.
	    map.moveCamera(CameraUpdateFactory.newLatLngZoom(lastKnown, 17));
	
	    // Zoom in, animating the camera.
	    map.animateCamera(CameraUpdateFactory.zoomTo(10), 2000, null);
	    
	    room.addChildEventListener(childEventListener);
            
    }
    

	private void setUserBitmap(String userId, Bitmap bitmap) {
		Marker marker = markers.get(userId);
		if (marker != null) {
			marker.setIcon(BitmapDescriptorFactory.fromBitmap(bitmap));
		} 
	}


    private void updateMyLocation(Location location) {
    	LatLng latlng = new LatLng(location.getLatitude(), location.getLongitude());
    	map.moveCamera(CameraUpdateFactory.newLatLng(latlng));
    	myMarker.setPosition(latlng);
    	
    	if (myAvatar == null) {
    		myAvatar = new Avatar();
    		people.put(uuid, myAvatar);
    	}
    	
    	myAvatar.setId(uuid);
    	myAvatar.setEmail(email);
    	myAvatar.setLat(location.getLatitude());
    	myAvatar.setLng(location.getLongitude());
    	
    	myself.setValue(myAvatar.toMap());
	}
    
    private void someoneChanged(DataSnapshot snap) {
    	System.out.println(" YOOO CHANGED "+ snap.getName() + " " + snap.getValue().getClass() + "  " +snap.getValue());
    	
    	if (uuid.equals(snap.getName())) { return; }
    	
    	Avatar person = people.get(snap.getName());
    	if (person == null) {
    		person = new Avatar();
    		people.put(snap.getName(), person);
    	}
    	
    	String oldEmail = person.getEmail();
    	
		person.updateFromMap((Map) snap.getValue());
		
		if (oldEmail == null || !oldEmail.equals(person.getEmail())) {
	        new RetrievePictureTask().execute("http://avatars.io/email/"+person.getEmail(), person.getId());
		}
    	
		Marker marker = markers.get(snap.getName());
		if (marker == null) {
			  marker = map.addMarker(new MarkerOptions()
		        .position(new LatLng(person.getLat(), person.getLng()))
		        .title(person.getEmail())
		        .snippet(person.getStatus())
		        .icon(BitmapDescriptorFactory
		            .fromResource(R.drawable.ic_launcher)));
			  markers.put(snap.getName(), marker);
		} else {
			marker.setPosition(new LatLng(person.getLat(), person.getLng()));
			marker.setTitle(person.getEmail());
			marker.setSnippet(person.getStatus());
		}
		
	}
    

	private void someoneParted(DataSnapshot snap) {
    	if (uuid.equals(snap.getName())) { return; }

    	Marker marker = markers.get(snap.getName());
    	if (marker != null) {
    		marker.remove();
    		markers.remove(snap.getName());
    	}
    	
    	people.remove(snap.getName());
	}
	
	private String getEmail() {
		Pattern emailPattern = Patterns.EMAIL_ADDRESS; // API level 8+
		Account[] accounts = AccountManager.get(getApplicationContext()).getAccountsByType("com.google");
		for (Account account : accounts) {
		    if (emailPattern.matcher(account.name).matches()) {
		        return account.name;
		    }
		}
		return null;
	}
	
	

    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    LocationListener locationListener = new LocationListener() {
        public void onLocationChanged(Location location) {
          updateMyLocation(location);
        }

		public void onStatusChanged(String provider, int status, Bundle extras) {
		}

        public void onProviderEnabled(String provider) {
        }

        public void onProviderDisabled(String provider) {
        }
    };

    ChildEventListener childEventListener = new ChildEventListener() {

        @Override
        public void onChildChanged(DataSnapshot snap, String previousName) {
            someoneChanged(snap);
        }

		@Override public void onCancelled() { }

		@Override
		public void onChildAdded(DataSnapshot snap, String arg1) {
			someoneChanged(snap);
		}

		@Override
		public void onChildMoved(DataSnapshot snap, String arg1) {
            System.out.println("Child MOVED "+ snap.getName() + " -> " + snap.getValue());
			
		}

		@Override
		public void onChildRemoved(DataSnapshot snap) {
			someoneParted(snap);
		}
    };
    
    
    class RetrievePictureTask extends AsyncTask<String, Void, Bitmap> {
    	private String id;

		@Override
		protected Bitmap doInBackground(String... params) {
			String src = params[0];
			id = params[1];
			
			 try {
				URL res = new URL(src);
				return BitmapFactory.decodeStream(res.openStream());
			} catch (IOException e) {		
				e.printStackTrace();
			}
		    return null;
		}
		
		protected void onPostExecute(Bitmap bitmap) {
			setUserBitmap(id, bitmap);
		}
    }
    
}
