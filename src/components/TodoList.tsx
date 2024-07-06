import Button from "./ui/Button";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Textarea from "./ui/Textarea";
import { ITodo } from "../interfaces";
import axiosInstance from "../config/axios.config";
import TodoSkeleton from "./TodoSkeleton";

const TodoList = () => {
  const [modals, setModals] = useState({
    edit: false,
    add: false,
    confirm: false,
  });
  const [queryVersion, setQueryVersion] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
  });

  const todoToAddTitleRef = useRef<HTMLInputElement>(null);
  const todoToAddDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const todoToEditTitleRef = useRef<HTMLInputElement>(null);
  const todoToEditDescriptionRef = useRef<HTMLTextAreaElement>(null);

  const storageKey = "loggedInUser";
  const userData = JSON.parse(localStorage.getItem(storageKey) || "{}");

  const { isLoading, data } = useCustomQuery({
    queryKey: ["todoList", `${queryVersion}`],
    url: "users/me?populate=todos",
    config: { headers: { Authorization: `Bearer ${userData.jwt}` } },
  });

  const handleModal = (
    modalName: "add" | "edit" | "confirm",
    state: boolean
  ) => {
    setModals((prev) => ({ ...prev, [modalName]: state }));
  };

  const handleChange = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isEdit: boolean
  ) => {
    const { value, name } = evt.target;
    if (isEdit) {
      if (name === "title") {
        todoToEditTitleRef.current!.value = value;
      } else if (name === "description") {
        todoToEditDescriptionRef.current!.value = value;
      }
    } else {
      if (name === "title") {
        todoToAddTitleRef.current!.value = value;
      } else if (name === "description") {
        todoToAddDescriptionRef.current!.value = value;
      }
    }
  };

  const handleApiCall = async (
    method: string,
    url: string,
    data: object = {}
  ) => {
    try {
      const response = await axiosInstance({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${userData.jwt}` },
      });
      return response;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onRemove = async () => {
    const response = await handleApiCall("delete", `/todos/${todoToEdit.id}`);
    if (response && response.status === 200) {
      handleModal("confirm", false);
      setQueryVersion((prev) => prev + 1);
    }
  };

  const onSubmitHandler = async (
    e: FormEvent<HTMLFormElement>,
    isEdit: boolean
  ) => {
    e.preventDefault();
    setIsUpdating(true);
    const todoData = {
      title: isEdit
        ? todoToEditTitleRef.current!.value
        : todoToAddTitleRef.current!.value,
      description: isEdit
        ? todoToEditDescriptionRef.current!.value
        : todoToAddDescriptionRef.current!.value,
    };
    const method = isEdit ? "put" : "post";
    const url = isEdit ? `/todos/${todoToEdit.id}` : "/todos";
    const response = await handleApiCall(method, url, {
      data: { ...todoData, user: isEdit ? undefined : [userData.user.id] },
    });
    if (response && response.status === 200) {
      handleModal(isEdit ? "edit" : "add", false);
      setQueryVersion((prev) => prev + 1);
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-1 p-3">
        {Array.from({ length: 3 }, (_, idx) => (
          <TodoSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex w-fit mx-auto my-10 gap-x-2">
        <Button
          variant="default"
          onClick={() => handleModal("add", true)}
          size="sm"
        >
          Post new todo
        </Button>
      </div>

      {data?.todos?.length ? (
        data.todos.map((todo: ITodo) => (
          <div
            key={todo.id}
            className="flex flex-wrap items-center justify-between hover:bg-gray-300 duration-300 p-3 rounded-md even:bg-gray-200"
          >
            <p className="font-semibold">
              {todo.id} - {todo.title}
            </p>
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setTodoToEdit(todo);
                  handleModal("edit", true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setTodoToEdit(todo);
                  handleModal("confirm", true);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ))
      ) : (
        <h3>No Todos Yet</h3>
      )}

      {/* Add Todo */}
      <Modal
        isOpen={modals.add}
        closeModal={() => handleModal("add", false)}
        title="Add a new todo"
      >
        <form className="space-y-3" onSubmit={(e) => onSubmitHandler(e, false)}>
          <Input
            name="title"
            defaultValue=""
            ref={todoToAddTitleRef}
            onChange={(e) => handleChange(e, false)}
          />
          <Textarea
            name="description"
            defaultValue=""
            ref={todoToAddDescriptionRef}
            onChange={(e) => handleChange(e, false)}
          />
          <div className="flex items-center space-x-3 mt-4">
            <Button
              className="bg-indigo-700 hover:bg-indigo-800"
              isLoading={isUpdating}
            >
              Done
            </Button>
            <Button
              type="button"
              variant="cancel"
              onClick={() => handleModal("add", false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Todo */}
      <Modal
        isOpen={modals.edit}
        closeModal={() => handleModal("edit", false)}
        title="Edit this todo"
      >
        <form className="space-y-3" onSubmit={(e) => onSubmitHandler(e, true)}>
          <Input
            name="title"
            defaultValue={todoToEdit.title}
            ref={todoToEditTitleRef}
            onChange={(e) => handleChange(e, true)}
          />
          <Textarea
            name="description"
            defaultValue={todoToEdit.description}
            ref={todoToEditDescriptionRef}
            onChange={(e) => handleChange(e, true)}
          />
          <div className="flex items-center space-x-3 mt-4">
            <Button
              className="bg-indigo-700 hover:bg-indigo-800"
              isLoading={isUpdating}
            >
              Update
            </Button>
            <Button
              variant="cancel"
              type="button"
              onClick={() => handleModal("edit", false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Remove Todo */}
      <Modal
        isOpen={modals.confirm}
        closeModal={() => handleModal("confirm", false)}
        title="Are you sure you want to remove this todo?"
        description="Deleting this todo will remove it permanently. Please make sure this is the correct action."
      >
        <div className="space-y-3">
          <p className="font-semibold">{todoToEdit.title}</p>
          <div className="flex items-center space-x-3 mt-4">
            <Button variant="danger" isLoading={isUpdating} onClick={onRemove}>
              Remove
            </Button>
            <Button
              variant="cancel"
              onClick={() => handleModal("confirm", false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TodoList;
