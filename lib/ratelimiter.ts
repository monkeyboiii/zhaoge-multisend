interface FunctionSignature {
  (...args: any[]): Promise<any>;
}

export function rateLimiter(
  fn: FunctionSignature,
  limit: number,
  interval: number
): FunctionSignature {
  let queue: any[] = []; // Queue to hold function calls
  let executing = false; // Flag to track if any function is executing

  // Define the proxy function
  const proxyFunction: FunctionSignature = async function (
    ...args: any[]
  ): Promise<any> {
    // Wrap the function call in a Promise
    return new Promise((resolve, reject) => {
      // Push the function call into the queue
      queue.push({ args, resolve, reject });

      if (!executing) {
        executing = true;

        const executeNext = async () => {
          if (queue.length > 0) {
            const { args, resolve, reject } = queue.shift();
            try {
              const result = await fn(...args); // Execute the original function
              resolve(result); // Resolve the promise with the result
            } catch (error) {
              reject(error); // Reject the promise with the error
            }

            // Schedule the next function call after the interval
            setTimeout(executeNext, interval);
          } else {
            executing = false; // No function is executing now
          }
        };

        // Start executing the queue
        executeNext();
      }
    });
  };

  // Return the proxy function
  return proxyFunction;
}

// Example async function to be rate-limited
async function exampleAsyncFunction(arg: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Processed: ${arg}`);
    }, 1000); // Simulating some asynchronous operation
  });
}

// Create a rate-limited proxy for the exampleAsyncFunction
const rateLimitedFunction = rateLimiter(
  exampleAsyncFunction,
  2,
  2000
); // Limit to 2 calls every 2 seconds

// Example usage of the rate-limited function
(async () => {
  console.log(await rateLimitedFunction("A"));
  console.log(await rateLimitedFunction("B"));
  console.log(await rateLimitedFunction("C")); // This call will be delayed due to rate limiting
  console.log(await rateLimitedFunction("D"));
  console.log(await rateLimitedFunction("E")); // This call will be delayed due to rate limiting
})();
