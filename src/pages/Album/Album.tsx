import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentData } from 'firebase/firestore';

import useUploadContext from '../../hooks/useUploadContext';
import useGetAlbumFeedList from '../../hooks/useGetAlbumFeedList';
import useGetFeedListData from '../../hooks/useGetFeedListData';
import useSetFeedItemLayout from './useSetFeedItemLayout';

import BreadcrumbWrap from '../../components/Breadcrumb/BreadcrumbWrap';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import FeedItem from './FeedItem';
import StyledH2 from '../../components/CommonStyled/StyledH2';
import StyledAlbum, { StyledFeedList, StyledAddFeedItem } from './StyledAlbum';

import AddIcon from '../../asset/icon/Add_L.svg';

export default function Album() {
  const [clientWitch, setClientWitch] = useState(
    document.documentElement.clientWidth,
  );
  const [feedList, setFeedList] = useState<DocumentData[]>([]);
  const { id } = useParams();
  const albumName = id?.replace(/-/gi, ' ');
  const getAlbumFeedList = useGetAlbumFeedList();
  const getFeedListData = useGetFeedListData();
  const { setAlbumNameListToAdd, setIsUploadModalOpen } = useUploadContext();
  const { imgRatio, setRatio, setGridRowEnd } = useSetFeedItemLayout();

  useEffect(() => {
    window.addEventListener('resize', () => {
      setClientWitch(document.documentElement.clientWidth);
    });

    (async () => {
      if (!albumName) {
        return;
      }

      const feedList = await getAlbumFeedList(albumName);

      if (!feedList?.length) {
        return;
      }

      const feedListData = await getFeedListData(feedList);

      if (!feedListData) {
        setFeedList([{}]);
        return;
      }

      setFeedList(feedListData);

      if (feedListData.length === 0) {
        setRatio(null);
      } else {
        setRatio(feedListData[feedListData.length - 1].imageUrl[0]);
      }
    })();
  }, []);

  const setUploadContext = () => {
    if (albumName) {
      setAlbumNameListToAdd(['전체 보기', albumName]);
    }

    setIsUploadModalOpen(true);
  };

  return (
    <StyledAlbum>
      {clientWitch > 1024 && (
        <>
          <StyledH2>{albumName}</StyledH2>
          <Breadcrumb
            navList={[
              { path: 'home', text: 'Home' },
              { path: `album/${albumName}`, text: albumName || '/' },
            ]}
          />
        </>
      )}
      {clientWitch > 430 && clientWitch <= 1024 && (
        <BreadcrumbWrap
          navList={[
            { path: 'home', text: 'Home' },
            { path: `album/${albumName}`, text: albumName || '/' },
          ]}
          title={albumName || ''}
        />
      )}
      <section>
        <h3 className="a11y-hidden">게시글 목록</h3>
        {feedList.length > 0 && (
          <StyledFeedList>
            {feedList.map((v) => {
              return <FeedItem key={v.id} feedData={v}></FeedItem>;
            })}
            {imgRatio.width && imgRatio.height && (
              <StyledAddFeedItem
                $ratio={imgRatio.width / imgRatio.height}
                ref={(node) => {
                  if (node) {
                    setGridRowEnd(node);
                  }
                }}
              >
                <button
                  type="button"
                  aria-label="새 게시물"
                  onClick={setUploadContext}
                >
                  <img src={AddIcon} alt="추가하기" />
                </button>
              </StyledAddFeedItem>
            )}
          </StyledFeedList>
        )}
      </section>
    </StyledAlbum>
  );
}
