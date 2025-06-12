"use client"

import { useEffect } from "react";

const City = ({children} : {children: React.ReactNode[]}) => {

  useEffect(() => {
    // console.log(children?.type);
  }, [children])

  return <>{children}</>
};

export default City