var mainVaultPath = null;

function loadOfflineMode(){
	if (mainVaultPath==null) {
		alert("No vault detected. Please add one to continue")
	}
	mainPageDidFinishLoading();
}

$(document).ready(loadOfflineMode);