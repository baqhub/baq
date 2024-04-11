import {HandlerOf} from "@baqhub/sdk";
import {ChangeEvent, FC, FormEvent, useState} from "react";

/*
 * Props.
 */

interface FolderFormProps {
  onFolderCreate: HandlerOf<string>;
}

/*
 * Component.
 */

export const FolderForm: FC<FolderFormProps> = ({onFolderCreate}) => {
  const [name, setName] = useState("");

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    setName("");
    onFolderCreate(name);
  };

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <div>
      <form onSubmit={onFormSubmit}>
        <input
          placeholder="New folder"
          title="Folder name."
          type="text"
          value={name}
          onChange={onNameChange}
        />
        <input type="submit" value="Create" />
      </form>
    </div>
  );
};
