import styled from 'styled-components';
import COLORS from '../styles/colors';
import { useState } from 'react';
import axios from 'axios';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { dbService } from '../apis/firebase';
import { useEffect } from 'react';
import { formatDate } from '../utils/date';
import { Recipe } from '../types/Recipe';

const Admin = () => {
  // 파이어스토어 컬렉션에 데이터 넣기
  const [recipeList, setRecipeList] = useState<Recipe[]>([]);

  const handleGetRecipeList = async () => {
    if (window.confirm('API를 수정하시겠습니까?')) {
      try {
        const serviceKey = process.env.REACT_APP_FOODSAFETYKOREA_API_KEY;
        const responses = await axios.all([
          axios.get(
            `http://openapi.foodsafetykorea.go.kr/api/${serviceKey}/COOKRCP01/json/1/1000`
          ),
          axios.get(
            `http://openapi.foodsafetykorea.go.kr/api/${serviceKey}/COOKRCP01/json/1001/2000`
          ),
        ]);
        const [firstResponse, secondResponse] = responses;
        const allData = firstResponse.data.COOKRCP01.row.concat(
          secondResponse.data.COOKRCP01.row
        );
        console.log('데이터: ', allData);
        setRecipeList(allData);

        allData.map((recipe: any) => {
          addDoc(collection(dbService, 'recipe-list'), {
            id: recipe.RCP_SEQ,
            image: recipe.ATT_FILE_NO_MK,
            name: recipe.RCP_NM,
            type: recipe.RCP_PAT2,
            calorie: recipe.INFO_ENG,
            carbohydrate: recipe.INFO_CAR,
            protein: recipe.INFO_PRO,
            fat: recipe.INFO_FAT,
            sodium: recipe.INFO_NA,
            ingredients: recipe.RCP_PARTS_DTLS,
            tip: recipe.RCP_NA_TIP,
            make: [
              recipe.MANUAL01,
              recipe.MANUAL02,
              recipe.MANUAL03,
              recipe.MANUAL04,
              recipe.MANUAL05,
              recipe.MANUAL06,
              recipe.MANUAL07,
              recipe.MANUAL08,
            ],
            makeImage: [
              recipe.MANUAL_IMG01,
              recipe.MANUAL_IMG02,
              recipe.MANUAL_IMG03,
              recipe.MANUAL_IMG04,
              recipe.MANUAL_IMG05,
              recipe.MANUAL_IMG06,
              recipe.MANUAL_IMG07,
              recipe.MANUAL_IMG08,
            ],
          });
        });
        alert('레시피 db가 수정되었습니다. 수정 사항을 입력 후 제출해주세요.');
      } catch (error) {
        console.error('레시피 리스트를 가져오지 못했어요. :', error);
      }
    } else {
      return;
    }
  };

  // 수정 사항 기록 폼
  const [inputValue, setInputValue] = useState('');
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await addDoc(collection(dbService, 'edit-data-history'), {
        description: inputValue,
        updatedAt: new Date().toString(),
      });
      setInputValue('');
      alert('수정 사항이 저장되었습니다.');
    } catch (error) {
      console.error('수정 사항 저장에 실패했습니다.', error);
      alert('수정 사항 저장에 실패했습니다.');
    }
  };

  // 수정 사항 가져오기
  interface EditHistory {
    description: string;
    updatedAt: string;
  }

  const [editHistoryList, setEditHistoryList] = useState<EditHistory[]>([]);

  const getEditDataHistory = async () => {
    const querySnapshot = await getDocs(
      collection(dbService, 'edit-data-history')
    );
    const historyList: any = [];

    querySnapshot.forEach((doc) => {
      const newRecipe: any = {
        id: doc.id,
        ...doc.data(),
      };
      historyList.push(newRecipe);
    });
    historyList.reverse();
    setEditHistoryList(historyList);
  };
  useEffect(() => {
    getEditDataHistory();
  }, []);

  return (
    <>
      <PageWrapper>
        <BoxWrapper>
          <EditHistoryBox>
            <Title>수정 기록</Title>
            <Contents>
              {editHistoryList.map((history, index) => (
                <History>
                  <p>{index + 1}.</p>
                  <p>{history.description}</p>
                  <p>{formatDate(history.updatedAt)}</p>
                </History>
              ))}
            </Contents>
          </EditHistoryBox>
          <EditFormBox>
            <Title>수정 사항 기록</Title>
            <Contents>
              <GuideBox>
                <p>1. 데이터를 수정한 후 가운데 버튼을 클릭해주세요.</p>
                <p>2. 수정 기록을 인풋창에 작성 후 제출 버튼을 클릭해주세요.</p>
              </GuideBox>
              <EditApiButtonWrapper>
                <img
                  src={require('../assets/default_image.png')}
                  onClick={handleGetRecipeList}
                />
              </EditApiButtonWrapper>
              <FormWrapper onSubmit={handleEditSubmit}>
                <Input
                  type="text"
                  maxLength={30}
                  placeholder="수정 사항을 입력하세요."
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                />
                <SubmitButton type="submit">입력</SubmitButton>
              </FormWrapper>
            </Contents>
          </EditFormBox>
        </BoxWrapper>
      </PageWrapper>
    </>
  );
};

export default Admin;

const PageWrapper = styled.div`
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 12.8rem);
  background-color: ${COLORS.backGround};
`;
const BoxWrapper = styled.div`
  /* width: 150rem; */
  width: 100rem;
  height: 40rem;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  font-size: 2rem;
  /* margin-top: 8rem; */

  /* background-color: yellow; */
`;
const EditHistoryBox = styled.div`
  width: 45rem;
  height: 30rem;
  display: flex;
  flex-direction: column;
  /* justify-content: space-around; */
  align-items: center;
  /* p {
    &:hover {
      color: ${COLORS.blue1};
      cursor: pointer;
    }
  } */
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.12),
    0 0.25rem 0.5rem rgba(0, 0, 0, 0.24);
`;

const EditFormBox = styled.div`
  width: 45rem;
  height: 30rem;

  display: flex;
  flex-direction: column;
  /* justify-content: space-around; */
  align-items: center;

  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.12),
    0 0.25rem 0.5rem rgba(0, 0, 0, 0.24);
`;

const Title = styled.div`
  width: inherit;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
`;

const Contents = styled.div`
  width: inherit;
  height: 27rem;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-direction: column;
`;

const History = styled.div`
  width: 38rem;
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  font-size: 1.25rem;

  & > p:last-child {
    margin-left: auto;
  }
`;

const GuideBox = styled.div`
  width: 30rem;

  font-size: 1.25rem;
`;

const EditApiButtonWrapper = styled.div`
  width: 7.5rem;
  height: 7.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
  }
`;

const FormWrapper = styled.form`
  position: relative;
`;

const Input = styled.input`
  width: 35rem;
  height: 2.5rem;
  border-radius: 1rem;
  border: 0.2rem solid ${COLORS.blue1};
  font-size: 1.25rem;
  outline: none;
  text-align: center;
`;

const SubmitButton = styled.button`
  position: absolute;
  right: 0rem;
  width: 5rem;
  height: 3rem;
  border-radius: 1rem;
  border: 0.2rem solid ${COLORS.blue1};
  font-size: 1.25rem;
  background-color: ${COLORS.blue1};
  color: white;
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: ${COLORS.blue2};
  }
`;
