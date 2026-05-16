import type { NextPageContext } from "next";

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <p>
      {statusCode
        ? `A ${statusCode} error occurred on server`
        : "An error occurred on client"}
    </p>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
