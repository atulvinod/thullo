import { Formik } from "formik";
import "../user-page.style.css";
import { validateEmail } from "../../../utils/common.util";
import { FormInput } from "../../../components/form-input/form-input.component";
import { Button } from "../../../components/button/button.component";
import { useState } from "react";
import { forgotPasswordRequest } from "../../../services/user.services";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { MoonLoader as Loader } from "react-spinners";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const navigate = useNavigate();

    const sendRequest = async (email) => {
        setIsLoading(true);
        try {
            await forgotPasswordRequest(email);
            alert("You will receive an email with the link to change password");
            navigate("/login");
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="user-page-container">
            <div className="user-form-container">
                <h1 className="mb-14">Forgot your password?</h1>
                <span className="mt-21">
                    Enter your email associated with your account, we will send
                    you a link to reset your password
                </span>
                <Formik
                    initialValues={{ email: "" }}
                    validate={(values) => {
                        const errors = {};
                        if (!values.email) {
                            errors.email = "Required";
                        } else if (!validateEmail(values.email)) {
                            errors.email = "Invalid email address";
                        }
                        return errors;
                    }}
                    onSubmit={(values) => {
                        sendRequest(values.email);
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <FormInput
                                label={"Email"}
                                placeholder={"Enter your email"}
                                className="input-w75"
                                onSubmit={handleSubmit}
                                type="email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                                name="email"
                                errors={
                                    errors.email &&
                                    touched.email &&
                                    errors.email
                                }
                            />
                            {error && error instanceof AxiosError ? (
                                <p className="user-error">
                                    {error.response.data.error}
                                </p>
                            ) : (
                                ""
                            )}
                            <div className="user-button-container">
                                <Button label={"Submit"} type="submit" />
                                <Loader loading={isLoading} size={22} />
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
