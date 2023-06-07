import { useEffect } from "react"
import { YANDEX_CREDENTIALS } from "../../constants"

function Login() {
    useEffect(() => {
        //@ts-ignore
        YaAuthSuggest.init(
            {
                client_id: YANDEX_CREDENTIALS.CLIENT_ID,
                response_type: "token",
                redirect_uri: YANDEX_CREDENTIALS.REDIRECT_URI,
            },
            YANDEX_CREDENTIALS.REDIRECT_URI,
            {
                view: "button",
                parentId: "login-container",
                buttonView: "main",
                buttonTheme: "light",
                buttonSize: "m",
                buttonBorderRadius: 0,
            }
            //@ts-ignore
        ).then(({ handler }) => handler())
    }, [])

    return <div id="login-container"></div>
}

export default Login
