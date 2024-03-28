import { Formik } from "formik";
import "../user-page.style.css";
import { FormInput } from "../../../components/form-input/form-input.component";
import { Button } from "../../../components/button/button.component";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { resetPasswordRequest } from "../../../services/user.services";
import { AxiosError } from "axios";

export default function ChangePasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            alert("Token is required to reset password");
            navigate("/login");
        }
    }, [token]);

    const sendRequest = async (password) => {
        try {
            setLoading(true);
            await resetPasswordRequest(token, password);
            alert("Your password has been changed");
        } catch (e) {
            console.log(e);
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-page-container">
            <div className="user-form-container">
                <h1>Change your password</h1>
                <Formik
                    initialValues={{ password: "", confirmPassword: "" }}
                    validate={(values) => {
                        const errors = {};
                        if (values.confirmPassword != values.password) {
                            errors.password = "Passwords don't match";
                        }
                        return errors;
                    }}
                    onSubmit={(values) => {
                        sendRequest(values.password);
                    }}
                >
                    {({
                        values,
                        errors,
                        handleChange,
                        handleSubmit,
                        handleBlur,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <FormInput
                                label={"New password"}
                                values={values.password}
                                onChange={handleChange}
                                placeholder={"Enter your new password"}
                                type="password"
                                onSubmit={handleSubmit}
                                onBlur={handleBlur}
                                name="password"
                            />
                            <FormInput
                                label={"Confirm password"}
                                values={values.confirmPassword}
                                onChange={handleChange}
                                placeholder={"Enter to confirm your password"}
                                type="password"
                                onSubmit={handleSubmit}
                                onBlur={handleBlur}
                                name="confirmPassword"
                            />
                            {error && error instanceof AxiosError ? (
                                <p className="user-error">
                                    {error.response.data.error}
                                </p>
                            ) : (
                                ""
                            )}
                            <div className="user-button-container">
                                <Button
                                    label={"Reset your password"}
                                    type="submit"
                                />
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
