import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import COLORS from '../../styles/colors';
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { authService } from '../../apis/firebase';

const Header = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false); // 로그인 모달 상태
  const [signUpModalIsOpen, setSignUpModalIsOpen] = useState(false); // 회원가입 모달 상태
  const [email, setEmail] = useState<string>(''); // 이메일 입력값
  const [emailMessage, setEmailMessage] = useState<string>(''); // 이메일 오류 메시지
  const [isEmail, setIsEmail] = useState<boolean>(false); // 이메일 유효성 검사
  const [password, setPassword] = useState<string>(''); // 패스워드 입력값
  const [passwordMessage, setPasswordMessage] = useState<string>(''); // 패스워드 오류 메시지
  const [isPassword, setIsPassword] = useState<boolean>(false); // 패스워드 유효성 검사
  const [confirmPassword, setConfirmPassword] = useState<string>(''); // 패스워드 재입력
  const [passwordConfirmMessage, setPasswordConfirmMessage] =
    useState<string>(''); // 패스워드 재입력 오류메시지
  const [isPasswordConfirm, setIsPasswordConfirm] = useState<boolean>(false); // 패스워드 재입력 유효성 검사
  const [nickname, setNickname] = useState<string>(''); // 닉네임 입력값
  const [nicknameMessage, setNicknameMessage] = useState<string>(''); // 닉네임 오류 메시지
  const [isNickname, setIsNickname] = useState<boolean>(false); // 닉네임 유효성 검사
  const emailRef = useRef<HTMLInputElement | null>(null); // 이메일 입력창 참조
  const passwordRef = useRef<HTMLInputElement | null>(null); // 패스워드 입력창 참조
  const [emailValid, setEmailValid] = useState(false); // 로그인 시 이메일 유효성 결과
  const [passwordValid, setPasswordValid] = useState(false); // 로그인 시 패스워드 유효성 결과

  // 로그인 모달
  const openLoginModal = () => {
    setSignUpModalIsOpen(false);
    setModalIsOpen(true);
  };
  const closeLoginModal = () => {
    setModalIsOpen(false);
  };
  // 회원가입 모달
  const openSignUpModal = () => {
    setModalIsOpen(false);
    setSignUpModalIsOpen(true);
  };
  const closeSignUpModal = () => {
    setSignUpModalIsOpen(false);
  };

  // 이메일 인풋, 유효성 검사
  const changeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const isValid = emailRegex.test(e.target.value);
    if (modalIsOpen) {
      setEmailValid(isValid);
    } else {
      if (!isValid) {
        setEmailMessage('이메일 형식을 확인해주세요');
        setIsEmail(false);
      } else {
        setEmailMessage('사용 가능한 이메일 형식입니다.');
        setIsEmail(true);
      }
    }
  };

  // 비밀번호 인풋, 유효성 검사
  const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
    const isValid = passwordRegex.test(e.target.value);
    if (modalIsOpen) {
      setPasswordValid(isValid);
    } else {
      if (!isValid) {
        setPasswordMessage(
          '대소문자, 특수문자를 포함하여 8자리 이상 입력해주세요.'
        );
        setIsPassword(false);
      } else {
        setPasswordMessage('사용 가능한 비밀번호 형식입니다.');
        setIsPassword(true);
      }
    }
  };

  // 비밀번호 확인 인풋, 유효성 검사
  const changeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentPasswordConfirm = e.target.value;
    setConfirmPassword(currentPasswordConfirm);
    if (password === currentPasswordConfirm) {
      setPasswordConfirmMessage('비밀번호가 일치합니다.');
      setIsPasswordConfirm(true);
    } else {
      setPasswordConfirmMessage('비밀번호가 일치하지 않습니다.');
      setIsPasswordConfirm(false);
    }
  };

  // 닉네임 인풋, 유효성 검사
  const changeNickname = (e: any) => {
    const currentNickname = e.target.value;
    setNickname(currentNickname);
    if (currentNickname.length < 2 || currentNickname.length > 4) {
      setNicknameMessage('닉네임은 2글자 이상, 4글자 미만으로 입력해주세요.');
      setIsNickname(false);
    } else {
      setNicknameMessage('사용 가능한 닉네임 형식입니다.');
      setIsNickname(true);
    }
  };

  // 회원가입 버튼
  const submitSignUp = () => {
    setPersistence(authService, browserSessionPersistence)
      .then(() => createUserWithEmailAndPassword(authService, email, password))
      .then(() => {
        if (authService.currentUser) {
          updateProfile(authService?.currentUser, {
            displayName: nickname,
          });
        }
      })
      .then(() => {
        alert('회원가입이 완료 되었습니다.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setNickname('');
        setSignUpModalIsOpen(false);
      })
      .catch((err) => {
        if (err.message.includes('already-in-use')) {
          alert('이미 가입된 계정입니다.');
          setEmail('');
        }
      });
  };

  // 로그인 버튼
  const submitLogin = () => {
    setPersistence(authService, browserSessionPersistence)
      .then(() => signInWithEmailAndPassword(authService, email, password))
      .then(() => {
        alert('환영합니다!');
        setEmail('');
        setPassword('');
        setModalIsOpen(false);
      })
      .catch((err) => {
        if (err.message.includes('user-not-found')) {
          alert('가입 정보가 없습니다. 회원가입을 먼저 진행해 주세요.');
          emailRef?.current?.focus();
          setEmail('');
          setPassword('');
        }
        if (err.message.includes('wrong-password')) {
          alert('잘못된 비밀번호 입니다.');
          passwordRef?.current?.focus();
          setPassword('');
        }
      });
  };

  return (
    <>
      <HeaderWrapper>
        <Logo>
          <Link to={'/'}>
            <LogoImg src={require('../../assets/logo.png')}></LogoImg>
          </Link>
        </Logo>
        <Text onClick={openLoginModal}>로그인</Text>
      </HeaderWrapper>
      {modalIsOpen && (
        <ModalWrapper>
          <Modal>
            <CloseButton onClick={closeLoginModal}>&times;</CloseButton>
            <TitleWrapper>로그인</TitleWrapper>
            <InputWrapper>
              <Logo>
                <LogoImg src={require('../../assets/logo.png')}></LogoImg>
              </Logo>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력해주세요."
                value={email}
                onChange={changeEmail}
                ref={emailRef}
              />
              {!emailValid && email.length > 0 && (
                <CustomSpan className={emailValid ? 'success' : 'error'}>
                  이메일 양식을 확인해주세요.
                </CustomSpan>
              )}

              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력해주세요."
                value={password}
                onChange={changePassword}
                ref={passwordRef}
              />
              {!passwordValid && password.length > 0 && (
                <CustomSpan className={passwordValid ? 'success' : 'error'}>
                  비밀번호 양식을 확인해주세요.
                </CustomSpan>
              )}
            </InputWrapper>
            <BottomWrapper>
              <Button onClick={submitLogin}>로그인하기</Button>
              <LoginText onClick={openSignUpModal}>
                아직 회원이 아니신가요?
              </LoginText>
            </BottomWrapper>
          </Modal>
        </ModalWrapper>
      )}
      {signUpModalIsOpen && (
        <ModalWrapper>
          <Modal>
            <CloseButton onClick={closeSignUpModal}>&times;</CloseButton>
            <TitleWrapper>회원가입</TitleWrapper>
            <InputWrapper>
              <Input
                id="email"
                type="email"
                placeholder="사용하실 이메일을 입력해주세요."
                value={email}
                onChange={changeEmail}
              />
              {email.length > 0 && (
                <CustomSpan className={isEmail ? 'success' : 'error'}>
                  {emailMessage}
                </CustomSpan>
              )}
              <Input
                id="password"
                type="password"
                placeholder="사용하실 비밀번호를 입력해주세요."
                value={password}
                onChange={changePassword}
              />
              {password.length > 0 && (
                <CustomSpan className={isPassword ? 'success' : 'error'}>
                  {passwordMessage}
                </CustomSpan>
              )}
              <Input
                id="confirm-password"
                type="password"
                placeholder="사용하실 비밀번호를 한 번 더 입력해주세요."
                value={confirmPassword}
                onChange={changeConfirmPassword}
              />
              {confirmPassword.length > 0 && (
                <CustomSpan className={isPasswordConfirm ? 'success' : 'error'}>
                  {passwordConfirmMessage}
                </CustomSpan>
              )}
              <Input
                id="nickname"
                type="text"
                maxLength={4}
                placeholder="사용하실 닉네임을 입력해주세요."
                value={nickname}
                onChange={changeNickname}
              />
              {nickname.length > 0 && (
                <CustomSpan className={isNickname ? 'success' : 'error'}>
                  {nicknameMessage}
                </CustomSpan>
              )}
            </InputWrapper>
            <BottomWrapper>
              <Button onClick={submitSignUp}>회원가입하기</Button>
              <LoginText onClick={openLoginModal}>이미 회원이신가요?</LoginText>
            </BottomWrapper>
          </Modal>
        </ModalWrapper>
      )}
    </>
  );
};

export default Header;

const HeaderWrapper = styled.div`
  height: 12.5rem;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-bottom: 0.25rem solid ${COLORS.blue1};
`;

const Logo = styled.div`
  width: 11rem;
  height: 11rem;
`;

const LogoImg = styled.img`
  width: 100%;
`;

const Text = styled.div`
  position: absolute;
  right: 2rem;
  bottom: 1rem;
  font-size: 2rem;
  cursor: pointer;
  &:hover {
    color: ${COLORS.blue2};
  }
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  border: 0.25rem solid ${COLORS.blue1};
  width: 40rem;
  height: 50rem;
  position: relative;
  text-align: center;
`;

const TitleWrapper = styled.div`
  width: inherit;
  height: 5rem;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InputWrapper = styled.div`
  width: inherit;
  height: 35rem;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-direction: column;
`;

const Input = styled.input`
  width: 30rem;
  height: 4rem;
  border-radius: 1rem;
  border: 0.25rem solid ${COLORS.blue1};
  font-size: 1.5rem;
  outline: none;
  text-align: left;
  padding-left: 1rem;
`;

const BottomWrapper = styled.div`
  width: inherit;
  height: 10rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
`;

const Button = styled.button`
  width: 31.5rem;
  height: 4.5rem;
  border-radius: 1rem;
  border: 0.25rem solid ${COLORS.blue1};
  font-size: 2rem;
  background-color: ${COLORS.blue1};
  color: #fff;
  cursor: pointer;
  outline: none;

  :disabled {
    background-color: ${COLORS.backGround};
    color: #fff;
  }
`;

const LoginText = styled.div`
  font-size: 1.5rem;
  cursor: pointer;
  &:hover {
    color: ${COLORS.blue2};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  z-index: 10;
  &:hover {
    color: ${COLORS.blue2};
  }
`;

const CustomSpan = styled.p`
  font-size: 1rem;
  margin: -2.2rem 0;
  &.success {
    color: ${COLORS.blue1};
  }
  &.error {
    color: ${COLORS.red};
  }
`;
