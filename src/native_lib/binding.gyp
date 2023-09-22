{
    "targets": [
        {
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "libraries": ["Wtsapi32.lib", "Userenv.lib"],
            "target_name": "native_lib",
            "sources": [
                "native_lib.cc"
            ],
            "cflags!": [
                "-fno-exceptions"
            ],
            "cflags_cc!": [
                "-fno-exceptions"
            ],
            "defines": [
                "NAPI_DISABLE_CPP_EXCEPTIONS"
            ]
        }
    ]
}
