import { Tag } from "../tag/tag.component";

export const TagRow = ({ tags }) => {
    return (
        <div className="d-flex d-flex-wrap d-gap-12">
            {tags.map((tag) => (
                <div key={tag.id}>
                    <Tag tagColor={tag.label_color} tagText={tag.label_name} />
                </div>
            ))}
        </div>
    );
};
