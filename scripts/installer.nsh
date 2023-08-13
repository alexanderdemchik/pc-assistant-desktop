!macro customHeader
    RequestExecutionLevel admin
!macroend

!macro customInstall
    ExecShellWait "" "$INSTDIR\resources\service\service-installer.exe" "install" SW_HIDE
!macroend

!macro customUnInit
    ExecShellWait "" "$INSTDIR\resources\service\service-installer.exe" "uninstall" SW_HIDE
!macroend