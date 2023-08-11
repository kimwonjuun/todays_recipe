import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import COLORS from '../styles/colors';
import Loading from '../components/common/Loading';
import IngredientBox from '../components/detail/IngredientBox';
import StepsBox from '../components/detail/StepsBox';
import { RecipeDataState } from '../recoil/atoms';
import { useRecoilValue } from 'recoil';
import {
  updateDoc,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { authService, dbService } from '../apis/firebase';
import useAlert from '../hooks/useAlert';
import { User } from 'firebase/auth';
import AlertModal from '../components/common/AlertModal';
import { getFormattedDate } from '../utils/date';
interface UserCommentProps {
  nickname: string;
  profilePic: string;
  name: string;
  id: string;
  comment: string;
  updatedAt: number;
}

const Detail = () => {
  // Recipe/RecipeBox, Search에서 받아온 각 레시피가 가지고 있는 고유한 id
  const { id } = useParams<{ id: string }>();

  // recoil 도입
  const recipeData = useRecoilValue(RecipeDataState);

  // 전체 레시피와 선택한 레시피의 고유한 id가 같다면 출력
  useEffect(() => {
    const selectedRecipe = recipeData.find(
      (recipe: Recipe) => recipe.id === id
    );
    if (selectedRecipe) {
      setRecipe(selectedRecipe);
      setLoading(false);
    }
  }, [recipeData, id]);

  // 선택한 레시피를 담아줄 state
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  console.log(recipe);

  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);

  // 유저
  const [user, setUser] = useState<User | null>(null);
  const currentUserUid = user?.uid ?? undefined;

  useEffect(() => {
    // user 객체 존재 시 setUser 업데이트
    const handleAuthStateChange = authService.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    });
    return () => {
      handleAuthStateChange();
    };
  }, []);

  // custom modal
  const {
    openAlert,
    closeAlert,
    isOpen: isAlertOpen,
    alertMessage,
  } = useAlert();

  // 댓글 인풋
  const [inputValue, setInputValue] = useState<string>('');

  // 댓글 리스트
  const [commentsList, setCommentsList] = useState<any>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 댓글 create
  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      openAlert('댓글을 1자 이상 입력 하세요.');
      setInputValue('');
      return;
    }

    try {
      if (!currentUserUid) {
        openAlert('댓글은 로그인 후 작성이 가능합니다.');
        return;
      }

      if (!inputValue) {
        openAlert('댓글을 입력해주세요.');
        return;
      }

      // 문서 가져오기
      const userDocRef = doc(dbService, 'users', currentUserUid);

      // 문서 데이터 가져오기
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      // 댓글 객체를 생성
      const newComment = {
        nickname: user?.displayName,
        profilePic: user?.photoURL,
        name: recipe?.name,
        id: recipe?.id,
        comment: inputValue,
        updatedAt: Date.now(),
      };

      // 'user-comments' 필드에 존재하는 배열에 새 댓글을 추가하고 문서 업데이트
      if (userData) {
        const userComments = userData['user-comments'] ?? [];

        await setDoc(userDocRef, {
          ...userData,
          'user-comments': [...userComments, newComment],
        });
      }
      setInputValue('');
    } catch (error) {
      console.error('댓글 저장에 실패했습니다.', error);
    }
  };

  // 댓글 read
  const getComments = () => {
    // users 컬렉션 참조
    const usersRef = collection(dbService, 'users');

    // users 컬렉션을 돌며 user-comments에 저장된 댓글 중 레시피 id와 일치하는 댓글을 comments에 추가
    onSnapshot(usersRef, (querySnapshot) => {
      const comments: UserCommentProps[] = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const userComments = userData['user-comments'] || [];

        userComments.forEach((comment: any) => {
          if (comment.id === id) {
            comments.push(comment);
          }
        });
      });

      // 댓글 업데이트 시간 순 정렬
      comments.sort((a, b) => a.updatedAt - b.updatedAt);
      setCommentsList(comments);
    });
  };

  useEffect(() => {
    getComments();
  }, []);

  return (
    <>
      <PageWrapper>
        {loading || !recipe ? (
          <Loading />
        ) : (
          <BoxWrapper>
            <IngredientBox recipe={recipe} />
            <StepsBox recipe={recipe} />
            <CommentBox>
              <CommentTitle>{commentsList.length}개의 댓글</CommentTitle>

              <CommentForm onSubmit={handleCommentSubmit}>
                <UserProfileWrapper>
                  {user?.photoURL ? (
                    <UserProfileImg src={user.photoURL} />
                  ) : (
                    <UserProfileImg
                      src={require('../assets/my/default_image.png')}
                    />
                  )}
                </UserProfileWrapper>
                <CommentInputWrapper>
                  <CommentInput
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="댓글을 입력해주세요..."
                    maxLength={50}
                  />
                </CommentInputWrapper>
                <CommentButtonWrapper>
                  <CommentButton>작성</CommentButton>
                </CommentButtonWrapper>
              </CommentForm>
              <CommentList>
                {commentsList && commentsList.length > 0 ? (
                  commentsList.map((item: UserCommentProps) => (
                    <CommentItem key={item.updatedAt}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <UserProfileImg src={item.profilePic} alt="Profile" />
                        <div
                          style={{
                            marginLeft: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            <UserName>{item.nickname}</UserName>
                            <UploadedAt>
                              {getFormattedDate(item.updatedAt)}
                            </UploadedAt>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              // marginLeft: '0.25rem',
                            }}
                          >
                            <CommentText>{item.comment}</CommentText>
                          </div>
                        </div>
                      </div>
                    </CommentItem>
                  ))
                ) : (
                  <p>댓글이 없습니다. 첫 댓글을 남겨보세요! 😎</p>
                )}
              </CommentList>
            </CommentBox>
          </BoxWrapper>
        )}
        <AlertModal
          message={alertMessage}
          isOpen={isAlertOpen}
          onClose={closeAlert}
        />
      </PageWrapper>
    </>
  );
};

export default Detail;

const CommentBox = styled.div`
  background-color: #fff;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.12),
    0 0.25rem 0.5rem rgba(0, 0, 0, 0.24);
  border-radius: 1rem;
  text-align: center;
  padding: 2.5rem;
`;

const CommentTitle = styled.h2`
  margin-bottom: 1rem;
`;
const CommentForm = styled.form`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  margin: 2rem 0;
`;
const UserProfileWrapper = styled.div`
  height: 4rem;
  width: 4rem;
  display: flex;
  align-items: center;
`;
const CommentInputWrapper = styled.div`
  /* height: 2.5rem; */
  display: flex;
  align-items: center;
  /* margin-left: 1rem; */
`;
const CommentButtonWrapper = styled.div`
  /* height: 2.5rem; */
  display: flex;
  align-items: center;
  /* margin-left: 1rem; */
`;
const UserProfileImg = styled.img`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
`;
const CommentInput = styled.input`
  width: 60rem;
  padding: 0.5rem;
  border: none;
  border-bottom: 0.2rem solid ${COLORS.blue2};
  border-radius: 0rem;
  outline: none;
  margin-left: 1rem;
  font-size: 1.25rem;

  &:focus {
    border-color: ${COLORS.blue1};
    /* border-bottom: 0.25rem solid ${COLORS.blue1}; */
  }
`;
const CommentButton = styled.button`
  width: 5rem;
  background-color: ${COLORS.blue2};
  font-size: 1.25rem;
  color: #fff;
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.blue1};
  }
`;

const CommentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CommentItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem 0;
  width: 100%;

  &:last-child {
    border-bottom: none;
  }
`;

const UploadedAt = styled.div`
  font-size: 1rem;
  color: ${COLORS.gray};
`;

const UserName = styled.p`
  font-weight: bold;
  margin-right: 1rem;
`;

const CommentText = styled.p`
  margin: 0;
  padding: 0;
`;

const PageWrapper = styled.div`
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${COLORS.backGround};
`;

const BoxWrapper = styled.div`
  width: 80rem;
  display: flex;
  flex-direction: column;

  font-size: 1.5rem;
  position: relative;
  margin: 4rem 0;
  overflow: hidden;
`;
