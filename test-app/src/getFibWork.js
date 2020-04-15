const getWork = () => {
  // const num = document.getElementById("num").value;

  return () => {
    function fibonacci(num) {
      if (num <= 1) return 1;

      return fibonacci(num - 1) + fibonacci(num - 2);
    }

    return fibonacci(45);
  };
};

export default getWork;
