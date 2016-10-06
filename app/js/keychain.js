<!-- keychain.js -->
var INDEX_UUID = 0,
            INDEX_TYPE = 1,
            INDEX_NAME = 2,
            INDEX_URL = 3,
            INDEX_DATE = 4,
            INDEX_FOLDER = 5,
            INDEX_PASSWORD_STRENGTH = 6,
            INDEX_TRASHED = 7;
        var TYPE_WEBFORMS = 'webforms.WebForm',
            TYPE_FOLDERS = 'system.folder.Regular',
            TYPE_NOTES = 'securenotes.SecureNote',
            TYPE_IDENTITIES = 'identities.Identity',
            TYPE_PASSWORDS = 'passwords.Password',
            TYPE_WALLET = 'wallet',
            TYPE_SOFTWARE_LICENSES = 'wallet.computer.License',
            TYPE_TRASHED = 'trashed',
            TYPE_ACCOUNT = 'account',
            TYPE_ACCOUNT_ONLINESERVICE = 'wallet.onlineservices.',
            TYPE_ACCOUNT_COMPUTER = 'wallet.computer.';
        var ERROR_BAD_DECRYPT = "Decryption failed",
            ERROR_INVALID_JSON = "Decryption passed but JSON was invalid",
            ERROR_OK = "OK";

        String.prototype.startsWith = function(str) {
            return (this.match("^" + str) == str);
        }

        String.prototype.escapeHTML = function() {
            return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function Keychain() {
            this.AUTOLOCK_LENGTH = 1 * 60 * 1000;
            this.autoLogoutTime = null;
            this.contents = {
                webforms: [],
                wallet: [],
                notes: [],
                identities: [],
                passwords: [],
                folders: []
            };
            this.encryptionKeys = null;
            this._all = null;
            this.masterPassword = null;
            this.encryptionKeysLoaded = false;
        }

        Keychain.prototype.setEncryptionKeys = function(keys) {
            this.encryptionKeys = keys;
            this.encryptionKeysLoaded = true;
        }

        Keychain.prototype.verifyPassword = function(password) {
            GibberishAES.size(128);
            this.encryptionKeys.decryptedKeys = {};

            var key = this.decryptEncryptionKey("SL5", password);
            if (!key) return false;

            this.masterPassword = password;
            return true;
        }

        Keychain.prototype.decryptEncryptionKey = function(sl, password) {
            for (var i = 0; i < this.encryptionKeys["list"].length; i++) {
                var item = this.encryptionKeys["list"][i];

                if (item['identifier'] == this.encryptionKeys[sl]) {
                    var iterations = parseInt(item['iterations'] || "0", 10);
                    if (iterations < 1000) iterations = 1000;

                    var decryptedKey = GibberishAES.decryptUsingPBKDF2(item["data"], password, iterations);
                    if (!decryptedKey) return null;

                    var verification = GibberishAES.decryptBase64UsingKey(item["validation"], GibberishAES.s2a(decryptedKey));
                    if (verification != decryptedKey) return null;

                    this.encryptionKeys.decryptedKeys[sl] = decryptedKey;
                    return decryptedKey;
                }
            }

            return null;
        }

        Keychain.prototype.keyForItem = function(item) {
            if (item.securityLevel == null) {
                return this.encryptionKeys.decryptedKeys["SL5"]
            }

            var key = this.encryptionKeys.decryptedKeys[item.securityLevel];
            if (!key) {
                key = this.decryptEncryptionKey(item.securityLevel, this.masterPassword);
            }
            return key;
        }

        Keychain.prototype.rescheduleAutoLogout = function() {
            this.autoLogoutTime = new Date().getTime() + this.AUTOLOCK_LENGTH;
        }

        Keychain.prototype.setContents = function(itemArray) {
            this._all = [];

            this.contents[TYPE_WEBFORMS] = [];
            this.contents[TYPE_NOTES] = [];
            this.contents[TYPE_WALLET] = [];
            this.contents[TYPE_PASSWORDS] = [];
            this.contents[TYPE_IDENTITIES] = [];
            this.contents[TYPE_SOFTWARE_LICENSES] = [];
            this.contents['folders'] = [];
            this.contents[TYPE_ACCOUNT] = [];
            this.contents[TYPE_TRASHED] = [];

            for (itemIndex in itemArray) {
                var item = new KeychainItemOverview(itemArray[itemIndex]);
                if (item.type.startsWith("system.")) continue;

                this._all[item.uuid] = item;

                var category = null;
                if (item.trashed == "Y") {
                    category = TYPE_TRASHED;
                } else {
                    if (item.type == TYPE_SOFTWARE_LICENSES) category = TYPE_SOFTWARE_LICENSES;
                    else if (item.type == TYPE_WEBFORMS) category = TYPE_WEBFORMS;
                    else if (item.type == TYPE_NOTES) category = TYPE_NOTES;
                    else if (item.type == TYPE_IDENTITIES) category = TYPE_IDENTITIES;
                    else if (item.type == TYPE_IDENTITIES) category = TYPE_IDENTITIES;
                    else if (item.type == TYPE_PASSWORDS) category = TYPE_PASSWORDS;
                    else if (item.type.startsWith(TYPE_FOLDERS)) category = 'folders';
                    else if (item.type.startsWith("wallet.membership")) category = TYPE_WALLET;
                    else if (item.type.startsWith("wallet.financial")) category = TYPE_WALLET;
                    else if (item.type.startsWith("wallet.government")) category = TYPE_WALLET;
                }

                if (category == null) category = TYPE_ACCOUNT;

                var itemsByType = this.contents[category];
                if (!itemsByType) {
                    alert(category);
                }

                itemsByType.push(item);
            }

            this.rescheduleAutoLogout();

            window.setTimeout(this._autoLogout, 1000);
        }

        Keychain.prototype.itemsOfType = function(name) {
            return this.contents[name];
        }

        Keychain.prototype.itemWithUuid = function(uuid) {
            return this._all[uuid];
        }

        Keychain.prototype._autoLogout = function() {
            var now = new Date();

            if (now.getTime() < keychain.autoLogoutTime) {
                window.setTimeout(keychain._autoLogout, 1000);
                return;
            }
            logout(true);
        }

        Keychain.prototype.lock = function() {
            if (this.encryptionKeys) {
                this.encryptionKeys.decryptedKeys = null;
            }
            this.masterPassword = null;
            this.encryptionKeysLoaded = false;
        }



        function KeychainItemOverview(data) {
            this.uuid = data[INDEX_UUID];
            this.type = data[INDEX_TYPE];
            this.title = data[INDEX_NAME];
            this.domain = data[INDEX_URL];
            this.updatedAtMs = data[INDEX_DATE] * 1000;
            this.trashed = data[INDEX_TRASHED];

            var date = new Date();
            date.setTime(this.updatedAtMs);
            this.updatedAt = date.format("mmm d, yyyy, h:MM:ss TT");
        }

        KeychainItemOverview.prototype.matches = function(s) {
            if (this.title.toLowerCase().indexOf(s) >= 0) return true;
            if (this.domain.toLowerCase().indexOf(s) >= 0) return true;
            return false;
        }


        function KeychainItem(data) {
            this.updatedAt = null; // TODO -- confirm that it can be deleted

            this.data = data;
            this.folderUuid = data.folderUuid;
            this.encrypted_contents = data.encrypted;
            this.decrypted = false;
            this.decrypted_secure_contents = null;

            this.uuid = data.uuid;
            this.type = data.typeName;
            this.title = data.title;
            this.domain = data.location;

            this.securityLevel = data.securityLevel;
            if (!data.securityLevel && data.openContents) {
                this.securityLevel = data.openContents.securityLevel;
            }

            if (!this.securityLevel) {
                this.securityLevel = "SL5";
            }

            this.updatedAtMs = data.updatedAt * 1000;

            folderName = keychain.itemWithUuid(this.folderUuid);
            if (!folderName) folderName = "None";
        }

        KeychainItem.prototype.decrypt = function() {
                GibberishAES.size(128);
                var plainText = null;
                var key = keychain.keyForItem(this);
                plainText = GibberishAES.decryptBase64UsingKey(this.encrypted_contents, GibberishAES.s2a(key));

                if (!plainText) {
                    return ERROR_BAD_DECRYPT;
                }

                // Decode UTF encoding that OpenSSL uses.
                plainText = decodeURIComponent(escape(plainText));

                var pt = '(' + plainText + ');';
                try {
                    this.decrypted_secure_contents = eval(pt);
                } catch (e) {
                    return ERROR_INVALID_JSON;
                }

                return ERROR_OK;
            },

            KeychainItem.prototype.isWebForm = function() {
                return this.data.typeName.indexOf(TYPE_WEBFORMS) == 0;
            }

        KeychainItem.prototype.asHTML = function() {
            switch (this.type) {
                case TYPE_WEBFORMS:
                    return this.webformHTML();
                    break;
                case TYPE_NOTES:
                    return this.secureNoteHTML();
                    break;
                case TYPE_SOFTWARE_LICENSES:
                    return this.walletHTML();
                    break;
                case TYPE_IDENTITIES:
                    return this.identityHTML();
                    break;
                case TYPE_PASSWORDS:
                    return this.passwordHTML();
            }

            if (this.type.startsWith(TYPE_WALLET)) {
                return this.walletHTML();
            }

            return "No asHTML defined for " + this.type + " uuid:" + this.uuid;
        }

        KeychainItem.prototype.passwordHTML = function() {
            var r = "<table><tr><th></th>";
            r += "<th><h1>" + this.title + "</h1></th></tr>";
            r += this.spacerTR();
            r += this.notesTR();
            r += this.spacerTR();
            r += "<tr><td class='label'>password</td><td class='concealed'>" + showAndHideConcealedField(this.uuid, this.decrypted_secure_contents.password, true) + "</td></tr></table>";
            return r;
        }

        KeychainItem.prototype.identityHTML = function() {
            var r = "<table><tr><th></th>";
            r += "<th><h1>" + this.title + "</h1></th></tr>";
            r += this.fieldSectionsHTML();
            r += this.spacerTR();
            r += this.notesTR();
            r += this.spacerTR();
            r += this.walletFields();
            r += "</table>";
            return r;
        }

        KeychainItem.prototype.walletHTML = function() {
            var r = "<table><tr><th></th>";
            r += "<th><h1>" + this.title + "</h1></th></tr>";
            r += this.fieldSectionsHTML();
            r += this.spacerTR();
            r += this.notesTR();
            r += this.spacerTR();
            r += this.walletFields();
            r += "</table>";
            return r;
        }

        KeychainItem.prototype.walletFields = function() {
            var entryValues = "";
            for (var key in this.decrypted_secure_contents) {
                if (key == 'sections') continue;
                if (key == 'notesPlain') continue;
                var v = this.decrypted_secure_contents[key];
                entryValues += "<tr><td class='label'>" + key.escapeHTML() + "</td><td>";

                try {
                    entryValues += v.escapeHTML();
                } catch (e) {
                    entryValues += v;
                }
                entryValues += "</td></tr>";
            }
            return entryValues;
        }

        KeychainItem.prototype.secureNoteHTML = function() {
            var r = "<table><tr colspan='2'>";
            r += "<th><h1>" + this.title + "</h1></th></tr>";

            var secure = this.decrypted_secure_contents;
            if (!secure.notesPlain || secure.notesPlain.length == 0) return "";

            return r + "<tr><td colspan='2'>" + convertNewLines(secure.notesPlain.escapeHTML()) + "</td></tr></table>";
        }

        KeychainItem.prototype.webformHTML = function() {
            var r = "<table><tr><th></th>";
            r += "<th><h1>" + this.title + "</h1>" + this.domain + "</th></tr>";

            r += "<tr><td class='label'>Username</td><td>" + this.loginUsername() + "</td></tr>";
            r += "<tr><td class='label'>Password</td><td class='concealed'>" + showAndHideConcealedField(this.uuid + '-password', this.loginPassword(), true) + "</td></tr>";

            if (devmode) {
                r += "<tr><td class='label'>UUID</td><td>" + this.uuid + "</td></tr>";
            }
            r += this.fieldSectionsHTML();
            r += this.spacerTR();
            r += this.notesTR();
            r += this.spacerTR();
            r += this.loginFields();
            r += "</table>";
            return r;
        }

        KeychainItem.prototype.findFieldWithDesignation = function(designation) {
            var count = this.decrypted_secure_contents.fields.length;
            for (var i = 0; i < count; ++i) {
                v = this.decrypted_secure_contents.fields[i];
                if (v.designation == designation) {
                    return v.value;
                }
            }
            return null;
        }

        KeychainItem.prototype.loginUsername = function() {
            var r = this.findFieldWithDesignation('username');
            return r ? r : "no field was designated as username";
        }

        KeychainItem.prototype.loginPassword = function() {
            var r = this.findFieldWithDesignation('password');
            return r ? r : "no field was designated as password";
        }

        KeychainItem.prototype.fieldSectionHTML = function(section) {
            var fields = section['fields'];
            if (fields == null || fields.length == 0) return "";

            var sectionName = section['name'];
            var sectionTitle = section['title'] || "";

            var result = "<tr><td></td><td class='section-title'>" + sectionTitle + "</td><tr>";
            for (var i = 0, len = fields.length; i < len; ++i) {
                var f = fields[i];
                var fname = f['n'] || "";
                var ftitle = f['t'] || "";
                var ftype = f['k'];
                var fvalue = (f['v'] || "").toString();
                if (fvalue === "") continue;

                result += "<tr><td class='label'>" + ftitle.escapeHTML() + "</td>";

                if ("concealed" == ftype) {
                    var id = "concealed-" + fname + "-" + i;
                    result += "<td class='concealed" > +showAndHideConcealedField(id, fvalue, true) + "</td>";
                } else {
                    result += "<td>" + fvalue.escapeHTML() + "</td>";
                }

                result += "</tr>";
            }

            return result;
        }

        KeychainItem.prototype.fieldSectionsHTML = function() {
            var sections = this.decrypted_secure_contents['sections'];
            if (!sections) return "";

            var result = "";
            var count = sections.length;
            for (var i = 0; i < count; ++i) {
                var sectionHTML = this.fieldSectionHTML(sections[i]);
                if (sectionHTML) {
                    result += this.spacerTR();
                    result += sectionHTML;
                }
            }

            return result;
        }

        KeychainItem.prototype.loginFields = function() {
            var entryValues = "";
            var count = this.decrypted_secure_contents.fields.length;
            for (var i = 0; i < count; ++i) {
                v = this.decrypted_secure_contents.fields[i];
                if (v.name == undefined || v.value == undefined) continue;
                entryValues += "<tr><td class='label'>" + v.name.escapeHTML() + "</td>";

                if (v.type == 'P' || v.designation == 'password') {
                    var id = "concealedField-" + this.uuid + "-" + i;
                    entryValues += "<td class='concealed'>" + showAndHideConcealedField(id, v.value, true) + "</td>";
                } else {
                    entryValues += "<td>" + v.value.escapeHTML() + "</td>";
                }
                entryValues += "</tr>";
            }
            return entryValues;
        }

        KeychainItem.prototype.spacerTR = function() {
            return "<tr><td class='spacer'></td></tr>";
        }

        KeychainItem.prototype.notesTR = function() {
            var secure = this.decrypted_secure_contents;
            if (!secure.notesPlain || secure.notesPlain.length == 0) return "";

            return "<tr><td class='label'>Notes</td><td>" + convertNewLines(secure.notesPlain.escapeHTML()) + "</td></tr>";
        }

        function encodeToHex(str) {
            var r = "";
            var e = str.length;
            var c = 0;
            var h;
            while (c < e) {
                h = str.charCodeAt(c++).toString(16);
                while (h.length < 2) h = "0" + h;
                r += h;
            }
            return r.toUpperCase();
        }