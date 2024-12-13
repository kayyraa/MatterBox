import * as Api from "./api.js";

const UsernameInput = document.querySelector(".Username");
const PasswordInput = document.querySelector(".Password");
const SubmitButton = document.querySelector(".SubmitButton");

const Supabase = Api.Supabase;

SubmitButton.addEventListener("click", async () => {
    const Username = UsernameInput.value;
    const Password = PasswordInput.value;
    if (!Username || !Password) return;

    const { data: Data, error: Error } = await Supabase.from("Users").select("*").eq("Username", Username).single();

    if (!Data) {
        const UserData = {
            Username: Username,
            Password: Password,
            Timestamp: Math.floor(Date.now() / 1000)
        };

        const { error: InsertError } = await Supabase.from("Users").insert(UserData);

        if (!InsertError) {
            localStorage.setItem("User", JSON.stringify(UserData));
            location.href = "../browser.html";
        }
    } else if (Data && Data.Password === Password) {
        const NewUserData = {
            Username: Username,
            Password: Password,
            Timestamp: Math.floor(Date.now() / 1000)
        };

        const { error: UpdateError } = await Supabase.from("Users").update(NewUserData).eq("Username", Username);

        if (!UpdateError) {
            localStorage.setItem("User", JSON.stringify(NewUserData));
            location.href = "../browser.html";
        }
    }
});