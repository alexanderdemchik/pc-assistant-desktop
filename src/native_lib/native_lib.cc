#include <Windows.h>
#include <WtsApi32.h>
#include <iostream>
#include <napi.h>
#include <userenv.h>
#include <tlhelp32.h>

using namespace std;

DWORD GetCurrentSessionId()
{
    WTS_SESSION_INFO *pSessionInfo;
    DWORD n_sessions = 0;
    BOOL ok = WTSEnumerateSessions(WTS_CURRENT_SERVER, 0, 1, &pSessionInfo, &n_sessions);
    if (!ok)
        return 0;

    DWORD SessionId = 0;

    for (DWORD i = 0; i < n_sessions; ++i)
    {
        if (pSessionInfo[i].State == WTSActive)
        {
            SessionId = pSessionInfo[i].SessionId;
            break;
        }
    }

    WTSFreeMemory(pSessionInfo);
    return SessionId;
}

DWORD getProcesByName(char *pName)
{
    DWORD pID = 0;
    HANDLE snapShot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    PROCESSENTRY32 pInfo;
    pInfo.dwSize = sizeof(PROCESSENTRY32);

    if (Process32First(snapShot, &pInfo))
    {
        while (Process32Next(snapShot, &pInfo))
        {
            if (_stricmp(pName, pInfo.szExeFile) == 0)
            {
                pID = pInfo.th32ProcessID;
                break;
            }
        }
    }

    CloseHandle(snapShot);
    return pID;
}

void GetSessionInformation()
{
    WTS_INFO_CLASS wtsInfoClass = WTSConnectState;
    LPWSTR pBuffer = NULL;
    DWORD bytesReturned = 0;
    LONG dwFlags = 0;
    WTSINFOEXW *pInfo = NULL;

    WTS_CONNECTSTATE_CLASS wts_connect_state = WTSDisconnected;
    WTS_CONNECTSTATE_CLASS *ptr_wts_connect_state = NULL;
    WTS_INFO_CLASS wtsic = WTSSessionInfoEx;

    if (WTSQuerySessionInformationW(WTS_CURRENT_SERVER_HANDLE, 0, wtsic, &pBuffer, &bytesReturned))
    {
        if (bytesReturned > 0)
        {
            pInfo = (WTSINFOEXW *)pBuffer;
            if (pInfo->Level == 1)
            {
                dwFlags = pInfo->Data.WTSInfoExLevel1.SessionFlags;
            }
            if (dwFlags == WTS_SESSIONSTATE_LOCK)
            {
                cout << "locked" << endl;
            }

            if (dwFlags == WTS_SESSIONSTATE_UNLOCK)
            {
                cout << "unknown" << endl;
            }
        }

        WTSFreeMemory(pBuffer);
    }
}

Napi::Boolean LaunchProcessAsSystemUser(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    DWORD processId = getProcesByName((char *)"winlogon.exe");
    string processPath = info[0].As<Napi::String>().Utf8Value();
    cout << processPath << endl;
    LPSTR cmd = processPath.data();

    cout << cmd << endl;
    BOOL ok = true;

    HANDLE hToken;
    HANDLE hProcess = OpenProcess(PROCESS_CREATE_THREAD | PROCESS_QUERY_INFORMATION | PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_VM_READ, false, processId);

    ok = OpenProcessToken(hProcess, TOKEN_QUERY | TOKEN_READ | TOKEN_IMPERSONATE | TOKEN_QUERY_SOURCE | TOKEN_DUPLICATE | TOKEN_ASSIGN_PRIMARY | TOKEN_EXECUTE, &hToken);

    if (!ok)
        return Napi::Boolean::New(env, false);

    void *environment = NULL;
    ok = CreateEnvironmentBlock(&environment, hToken, TRUE);

    cout << "wow";
    if (!ok)
    {
        CloseHandle(hToken);
        return Napi::Boolean::New(env, false);
    }

    cout << "wow";
    STARTUPINFO si = {sizeof(si)};

    PROCESS_INFORMATION pi = {};
    si.lpDesktop = "winsta0\\Winlogon";

    // Do NOT want to inherit handles here
    DWORD dwCreationFlags = NORMAL_PRIORITY_CLASS | CREATE_UNICODE_ENVIRONMENT;

    ok = CreateProcessAsUser(hToken, NULL, cmd, NULL, NULL, FALSE,
                             dwCreationFlags, environment, NULL, &si, &pi);

    DestroyEnvironmentBlock(environment);
    CloseHandle(hToken);

    if (!ok)
        return Napi::Boolean::New(env, false);

    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);
    return Napi::Boolean::New(env, true);
}

/**
 * Active desktop change listener, calls js callback on desktop change
 */
Napi::FunctionReference jsListenDesktopChangeCallback;
void CALLBACK WinEventProc(HWINEVENTHOOK hWinEventHook, DWORD event, HWND hwnd, LONG idObject, LONG idChild, DWORD dwEventThread, DWORD dwmsEventTime)
{
    if (event == EVENT_SYSTEM_DESKTOPSWITCH && jsListenDesktopChangeCallback != nullptr)
    {
        jsListenDesktopChangeCallback.Call({});
    }
}

void ListenDesktopChange(const Napi::CallbackInfo &info)
{
    jsListenDesktopChangeCallback = Napi::Persistent(info[0].As<Napi::Function>());
    HWINEVENTHOOK hHook = SetWinEventHook(EVENT_MIN, EVENT_MAX, NULL, WinEventProc, 0, 0, WINEVENT_OUTOFCONTEXT);
    if (hHook == NULL)
    {
        cout << "error";
        // Handle error
    }

    // Wait for events
    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    UnhookWinEvent(hHook);
}

HDESK lastOpenInputHandle = nullptr;
void openInputDesktop(const Napi::CallbackInfo &info)
{
    if (lastOpenInputHandle != nullptr)
    {
        CloseDesktop(lastOpenInputHandle);
    }

    lastOpenInputHandle = OpenInputDesktop(0, true, GENERIC_ALL);

    if (lastOpenInputHandle != 0)
    {
        SetThreadDesktop(lastOpenInputHandle) && SwitchDesktop(lastOpenInputHandle);
    }
}

void closeDesktop(const Napi::CallbackInfo &info)
{
}

// bool IsSecureDesktopOpen()
// {
//     WTSINFOEXW* pInfo = NULL;
//     WTS_INFO_CLASS wtsic = DW_WTSSessionInfoEx;
//     bool bRet = false;
//     LPTSTR ppBuffer = NULL;
//     DWORD dwBytesReturned = 0;
//     LONG dwFlags = 0;

//     if (WTSQuerySessionInformationW(WTS_CURRENT_SERVER_HANDLE, WTS_CURRENT_SESSION, wtsic, &ppBuffer, &dwBytesReturned)) {
//         if (dwBytesReturned > 0) {
//             pInfo = (WTSINFOEXW*)ppBuffer;
//             if (pInfo->Level == 1) {
//                 dwFlags = pInfo->Data.WTSInfoExLevel1.SessionFlags;
//             }
//             if (dwFlags == WTS_SESSIONSTATE_LOCK) {
//                 bRet = true;
//             }
//         }
//         WTSFreeMemory(ppBuffer);
//         ppBuffer = NULL;
//     }

//     return bRet;
// }

int i = 0;
int inc()
{
    return i++;
}

void Test(const Napi::CallbackInfo &info)
{
    cout << inc() << endl;
}

Napi::String Method(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, "world");
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "listenDesktopChange"),
                Napi::Function::New(env, ListenDesktopChange));

    exports.Set(Napi::String::New(env, "openInputDesktop"),
                Napi::Function::New(env, openInputDesktop));

    exports.Set(Napi::String::New(env, "launchProcessAsSystemUser"),
                Napi::Function::New(env, LaunchProcessAsSystemUser));

    return exports;
}
NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
