import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "./Button";

test("renderiza um botão com o texto correto", () => {
  render(<Button text="Click me" onClick={() => {}} />);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});
