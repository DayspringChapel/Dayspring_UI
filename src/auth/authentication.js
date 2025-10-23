export async function authenticate(userName, userPassword, url)
{
    const response = await fetch(url,{
        method: "POST",
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            userNameOrEmail: userName,
            password: userPassword
        })
    });

    if(response.ok)
    {
        const resp = await response.json()
        return {status: true, data: resp}
    }
    else
    {
        const data = await response.json();
        return { status: true, data };
    }
}