import { Formik } from "formik";
import "../user-page.style.css";
import { FormInput } from "../../../components/form-input/form-input.component";
import { Button } from "../../../components/button/button.component";
import { ClipLoader } from "react-spinners";
import { UserImageInput } from "../../../components/user-image-input/user-image-input.component";
import { validateEmail } from "../../../utils/common.util";
import { registerUser } from "../../../services/user.services";
import { useDispatch, useSelector } from "react-redux";
import {
    loadingSelector,
    registerErrorSelector,
    tokenSelector,
} from "../../../store";
import { AxiosError } from "axios";
import { registerUserAction } from "../../../store/user/user.action";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const RegisterPage = () => {
    const dispatch = useDispatch();
    const isLoading = useSelector(loadingSelector);
    const registerError = useSelector(registerErrorSelector);
    const token = useSelector(tokenSelector);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && token.length) {
            navigate("/");
        }
    }, [token]);

    return (
        <div className="user-page-container">
            <div className="user-form-container">
                <h1>Register</h1>
                <Formik
                    initialValues={{
                        name: "",
                        email: "",
                        password: "",
                        confirmpassword: "",
                        image: "",
                    }}
                    validate={(values) => {
                        const errors = {};
                        Object.entries(values).forEach(([key]) => {
                            if (key !== "image") {
                                if (!values[key]) {
                                    errors[key] = "Field is required";
                                }
                            }
                        });
                        if (!values.email) {
                            errors.email = "Required";
                        } else if (validateEmail(values.email)) {
                            errors.email = "Invalid Email Address";
                        }

                        if (values.password !== values.confirmpassword) {
                            errors.confirmpassword =
                                "Password and Confirm password should be the same";
                        }
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        dispatch(registerUserAction(values));
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
                            <UserImageInput
                                handleSetImage={(image) => {
                                    values.image = image;
                                }}
                            />
                            <FormInput
                                label={"Name"}
                                placeholder={"Enter name"}
                                onSubmit={handleSubmit}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.name}
                                name="name"
                            />
                            <FormInput
                                label={"Email"}
                                placeholder={"Enter Email"}
                                onSubmit={handleSubmit}
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
                                name="password"
                                label={"Password"}
                                placeholder={"Enter Password"}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onSubmit={handleSubmit}
                                value={values.password}
                                errors={
                                    errors.password &&
                                    touched.password &&
                                    errors.password
                                }
                            />
                            <FormInput
                                name="confirmpassword"
                                label={"Confirm Password"}
                                placeholder={"Confirm password"}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onSubmit={handleSubmit}
                                value={values.confirmpassword}
                                errors={
                                    errors.confirmpassword &&
                                    touched.confirmpassword &&
                                    errors.confirmpassword
                                }
                            />
                            {registerError &&
                            registerError instanceof AxiosError ? (
                                <p className="user-error">
                                    {registerError.response.data}
                                </p>
                            ) : (
                                ""
                            )}
                            <div className="user-button-container">
                                <Button label={"Register"} type={"submit"} />
                                <ClipLoader loading={isLoading} />
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    );
};
