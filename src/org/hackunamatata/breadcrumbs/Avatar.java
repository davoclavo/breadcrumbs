package org.hackunamatata.breadcrumbs;

import java.util.HashMap;
import java.util.Map;

public class Avatar {
	
	private String id;
	private double lat;
	private double lng;
	private String status;
	private String email;
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public double getLat() {
		return lat;
	}
	
	public void setLat(double d) {
		this.lat = d;
	}
	
	public double getLng() {
		return lng;
	}
	
	public void setLng(double d) {
		this.lng = d;
	}
	
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getEmail() {
		return email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	public Map<String,String> toMap() {
		Map<String, String> data = new HashMap<String,String>();
    	data.put("id", id);
    	data.put("email", email);
    	data.put("lat", lat + "");
    	data.put("lng", lng + "");
    	data.put("status", status);
    	return data;
	}
	
	public void updateFromMap(Map data) {
		this.id = (String) data.get("id");
		this.email = (String) data.get("email");
		this.status  = (String) data.get("status");
		this.lat = Double.valueOf( data.get("lat") + "" );
		this.lng = Double.valueOf( data.get("lng") + "" );
	}
	

}
