import "./form-input.style.css";

export const FormInput = ({
    label,
    errors,
    placeholder,
    style,
    ...inputProps
}) => {
    return (
        <div>
            <div className="form-input-container" style={{ ...style }}>
                <label className="form-label">{label}</label>
                <input
                    placeholder={placeholder}
                    {...inputProps}
                    className="input"
                />
                <label htmlFor="" className="errors">
                    {errors}
                </label>
            </div>
        </div>
    );
};
