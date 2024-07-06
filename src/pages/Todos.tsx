import useCustomQuery from "../hooks/useAuthenticatedQuery";
import Paginator from "../components/ui/Paginator";
import { ChangeEvent, useState, useCallback } from "react";
import Button from "../components/ui/Button";
import axiosInstance from "../config/axios.config";
import { faker } from "@faker-js/faker";
import { formatDate, formatTime } from "../lib/utils";

interface TodoAttributes {
  title: string;
  description: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Todo {
  id: number;
  attributes: TodoAttributes;
}

const useTodos = (
  page: number,
  pageSize: number,
  sortBy: "DESC" | "ASC",
  jwt: string
) => {
  return useCustomQuery({
    queryKey: [`todos-page-${page}`, `${pageSize}`, `${sortBy}`],
    url: `/todos?pagination[pageSize]=${pageSize}&pagination[page]=${page}&sort=createdAt:${sortBy}`,
    config: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });
};

const TodosPage = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<"DESC" | "ASC">("DESC");

  const { isLoading, data, isFetching, error } = useTodos(
    page,
    pageSize,
    sortBy,
    userData.jwt
  );

  // Handlers
  const onClickPrev = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const onClickNext = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const onChangePageSize = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
  }, []);

  const onChangeSortBy = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "DESC" | "ASC");
  }, []);

  const onGenerateTodos = useCallback(async () => {
    for (let i = 0; i < 15; i++) {
      try {
        const { data } = await axiosInstance.post(
          `/todos`,
          {
            data: {
              title: faker.word.words(5),
              description: faker.lorem.paragraph(2),
              user: [userData.user.id],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${userData.jwt}`,
            },
          }
        );
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }
  }, [userData]);

  if (isLoading) return <h3>Loading...</h3>;
  if (error) return <h3>Error loading todos</h3>;

  // const todos = useMemo(() => data?.data || [], [data]);
  const todos = data?.data || [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <Button size="sm" onClick={onGenerateTodos} title="Generate 15 records">
          Generate todos
        </Button>
        <div className="flex items-center justify-between gap-1 text-md">
          <select
            className="border-2 border-indigo-600 rounded-md p-2"
            value={sortBy}
            onChange={onChangeSortBy}
          >
            <option disabled>Sort by</option>
            <option value="ASC">Oldest</option>
            <option value="DESC">Latest</option>
          </select>
          <select
            className="border-2 border-indigo-600 rounded-md p-2"
            value={pageSize}
            onChange={onChangePageSize}
          >
            <option disabled>Page Size</option>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div className="my-10 space-y-6">
        {todos.length ? (
          todos.map(({ id, attributes }: Todo) => (
            <div
              key={id}
              className="flex flex-col justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100"
            >
              <h3 className="w-full font-semibold">
                {id} - {attributes.title}
              </h3>
              <p className="border-y my-2 py-2">{attributes.description}</p>
              <div>
                <p>
                  published: {formatDate(attributes.publishedAt)}{" "}
                  {formatTime(attributes.publishedAt)}
                </p>
                <p>
                  created: {formatDate(attributes.createdAt)}{" "}
                  {formatTime(attributes.createdAt)}
                </p>
                <p>
                  updated: {formatDate(attributes.updatedAt)}{" "}
                  {formatTime(attributes.updatedAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <h3>No Todos Yet</h3>
        )}
        <Paginator
          isLoading={isLoading || isFetching}
          total={data.meta.pagination.total}
          page={page}
          pageCount={data.meta.pagination.pageCount}
          onClickPrev={onClickPrev}
          onClickNext={onClickNext}
        />
      </div>
    </>
  );
};

export default TodosPage;
