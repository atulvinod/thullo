import "./tag.style.css";
import tinycolor from "tinycolor2";

export const Tag = ({ tagColor, tagText }) => {
    const textColor = (tagColor) => {
        const color = tinycolor(tagColor);
        return color.lighten(100).toString();
    };
    return (
        <div className="tag" style={{ backgroundColor: tagColor }}>
            <span
                className="fnt-10 fnt-wt-500"
                style={{ color: textColor(tagColor) }}
            >
                {tagText}
            </span>
        </div>
    );
};
