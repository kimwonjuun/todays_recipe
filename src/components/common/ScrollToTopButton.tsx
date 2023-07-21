import { useState, useEffect } from 'react';
import styled from 'styled-components';
import COLORS from '../../styles/colors';

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState<boolean>(false);

  const HandleButton = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleShowButton = () => {
    const { scrollY } = window;
    scrollY > 200 ? setShowButton(true) : setShowButton(false);
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleShowButton);

    return () => {
      window.removeEventListener('scroll', toggleShowButton);
    };
  }, []);
  return (
    <>
      <Button onClick={HandleButton} style={{ opacity: showButton ? 1 : 0 }}>
        <img src={require('../../assets/top_button.png')} />
      </Button>
    </>
  );
};

export default ScrollToTopButton;

const Button = styled.div`
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;

  position: fixed;
  right: 2rem;
  bottom: 2rem;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  // opacity를 여기에서 삭제하세요.
  transition: opacity 300ms ease-in-out;

  background-color: ${COLORS.blue1};

  &:hover {
    opacity: 0.8;
  }

  & > img {
    width: 35%;
  }
`;
