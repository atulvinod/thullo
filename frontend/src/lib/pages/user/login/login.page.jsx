import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../components/button/button.component";
import { FormInput } from "../../../components/form-input/form-input.component";
import "../user-page.style.css";
import { Formik } from "formik";
import { loginUserAction } from "../../../store/user/user.action";
import {
    loadingSelector,
    loginErrorSelector,
    tokenSelector,
} from "../../../store";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";
import { MoonLoader as Loader } from "react-spinners";
import { Link } from "react-router-dom";
import { validateEmail } from "../../../utils/common.util";

export const LoginPage = () => {
    const dispatch = useDispatch();
    const token = useSelector(tokenSelector);
    const loginError = useSelector(loginErrorSelector);
    const isLoading = useSelector(loadingSelector);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        if (token && token.length) {
            navigate("/");
        }
    }, [token]);

    return (
        <div className="user-page-container">
            <div className="user-form-container">
                <h1>Login</h1>
                <Formik
                    initialValues={{
                        email: searchParams.get("email"),
                        password: "",
                    }}
                    validate={(values) => {
                        const errors = {};
                        if (!values.email) {
                            errors.email = "Required";
                        } else if (!validateEmail(values.email)) {
                            errors.email = "Invalid Email Address";
                        }

                        if (!values.password) {
                            errors.password = "Password is required";
                        }
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        dispatch(
                            loginUserAction({
                                email: values.email,
                                password: values.password,
                            })
                        );
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <FormInput
                                label={"Email"}
                                placeholder={"Enter Email"}
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
                            <FormInput
                                label={"Password"}
                                placeholder={"Enter Password"}
                                className="input-w75"
                                type="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                                name="password"
                                errors={
                                    errors.email &&
                                    touched.email &&
                                    errors.email
                                }
                            />
                            {loginError && loginError instanceof AxiosError ? (
                                <p className="user-error">
                                    {loginError.response.data.error}
                                </p>
                            ) : (
                                ""
                            )}
                            <div className="mt-10">
                                <Link to="/forgot-password">
                                    Forgot your password?
                                </Link>
                            </div>

                            <div className="user-button-container">
                                <Button label={"Login"} type={"submit"} />
                                <Loader loading={isLoading} size={22} />
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    );
};
