const static = {
   "endpoint":{
      "adminEmail":"nathan@albrecht.id",
      "allowedCommercialApps":[
         "world.type.app"
      ],
      "canonicalURL":"https://nathanalbrecht.com/typeworld-playground/static.json",
      "licenseIdentifier":"CC-BY-NC-ND-4.0",
      "name":{
         "en":"Nathan Albrecht Static Playground"
      },
      "privacyPolicyURL":"https://type.world/legal/default/PrivacyPolicy.html",
      "public":false,
      "publisherTypes":[
         "free"
      ],
      "sendsLiveNotifications":false,
      "supportedCommands":[
         "endpoint",
         "installableFonts",
         "installFonts"
      ],
      "termsOfServiceURL":"https://type.world/legal/default/TermsOfService.html",
      "websiteURL":"https://nathanalbrecht.com"
   },
   "installFonts":{
      "assets":[
         {
            "dataURL":"https://www.kutilek.de/typeworld/fonts/selectric-century/1.0/SelectricCentury-Medium8.ttf",
            "mimeType":"font/ttf",
            "response":"success",
            "uniqueID":"de.kutilek.SelectricCentury-Medium8.ttf",
            "version":"1.0"
         },
         {
            "dataURL":"https://www.kutilek.de/typeworld/fonts/selectric-century/1.0/SelectricCentury-Medium9.ttf",
            "mimeType":"font/ttf",
            "response":"success",
            "uniqueID":"de.kutilek.SelectricCentury-Medium9.ttf",
            "version":"1.0"
         },
         {
            "dataURL":"https://www.kutilek.de/typeworld/fonts/selectric-century/1.0/SelectricCentury-Medium9Clean.ttf",
            "mimeType":"font/ttf",
            "response":"success",
            "uniqueID":"de.kutilek.SelectricCentury-Medium9Clean.ttf",
            "version":"1.0"
         }
      ],
      "response":"success"
   },
   "installableFonts":{
      "foundries":[
         {
            "families":[
               {
                  "fonts":[
                     {
                        "format":"ttf",
                        "free":true,
                        "name":{
                           "en":"Medium 8"
                        },
                        "postScriptName":"SelectricCentury-Medium8",
                        "purpose":"desktop",
                        "status":"prerelease",
                        "uniqueID":"de.kutilek.SelectricCentury-Medium8.ttf",
                        "usedLicenses":[
                           {
                              "keyword":"ofl"
                           }
                        ]
                     },
                     {
                        "format":"ttf",
                        "free":true,
                        "name":{
                           "en":"Medium 9"
                        },
                        "postScriptName":"SelectricCentury-Medium9",
                        "purpose":"desktop",
                        "status":"prerelease",
                        "uniqueID":"de.kutilek.SelectricCentury-Medium9.ttf",
                        "usedLicenses":[
                           {
                              "keyword":"ofl"
                           }
                        ]
                     },
                     {
                        "format":"ttf",
                        "free":true,
                        "name":{
                           "en":"Medium 9 Clean"
                        },
                        "postScriptName":"SelectricCentury-Medium9Clean",
                        "purpose":"desktop",
                        "status":"prerelease",
                        "uniqueID":"de.kutilek.SelectricCentury-Medium9Clean.ttf",
                        "usedLicenses":[
                           {
                              "keyword":"ofl"
                           }
                        ]
                     }
                  ],
                  "name":{
                     "en":"Fake Family"
                  },
                  "uniqueID":"qwerty"
               }
            ],
            "licenses":[
               {
                  "keyword":"ofl",
                  "name":{
                     "en":"SIL Open Font License"
                  },
                  "URL":"https://scripts.sil.org/OFL_web"
               }
            ],
            "name":{
               "en":"Nathan Albrecht Fake Foundry"
            },
            "uniqueID":"ABC"
         }
      ],
      "prefersRevealedUserIdentity":false,
      "response":"success"
   },
   "version":"0.2.9-beta"
};

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    body: JSON.stringify(static)
  };
};