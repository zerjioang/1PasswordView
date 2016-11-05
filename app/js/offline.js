var fs = require('fs');
var path = require('path');
        
var mainVaultPath;

function loadOfflineMode(){

	if(!sessionStorage.loginbanned){
		if (mainVaultPath==null) {
		//attempt to read from session storage
		if (sessionStorage.mainVaultPath) {
			mainVaultPath = sessionStorage.mainVaultPath;
		}
		else{
			//promt to user
			var defaultPath = "C:\\Development\\Proyectos\\1PasswordView\\demo-vault\\";
			mainVaultPath = window.prompt("Define default vault location",defaultPath);
			//save that path on sessionstorage
			sessionStorage.mainVaultPath = mainVaultPath;
		}
	}
		mainPageDidFinishLoading();
		sessionStorage.loginbanned = true;
	}

}

$(document).ready(loadOfflineMode);