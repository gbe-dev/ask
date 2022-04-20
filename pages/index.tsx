import Accept from 'components/Accept'
import AttributeOffer from 'components/AttributeOffer'
import Buy from 'components/Buy'
import Cancel from 'components/Cancel'
import CollectionOffer from 'components/CollectionOffer'
import ConnectWallet from 'components/ConnectWallet'
import Layout from 'components/Layout'
import List from 'components/List'
import TokenOffer from 'components/TokenOffer'
import useUserAsks from 'hooks/useUserAsks'
import { useAccount } from 'wagmi'
import { FiExternalLink } from 'react-icons/fi'
import MultiBuy from 'components/MultiBuy'

const IndexPage = () => {
  // wagmi hooks
  const [{ data: accountData }] = useAccount()

  // Load an user's active list order using
  //the `/orders/asks/v1` endpoint
  // MAINNET: https://api.reservoir.tools/#/4.%20NFT%20API/getOrdersAsksV1
  // RINKEBY: https://api-rinkeby.reservoir.tools/#/4.%20NFT%20API/getOrdersAsksV1
  const orders = useUserAsks(accountData?.address)
  const userAddress = accountData?.address

  return (
    <Layout>
      <header className="header sticky-top">
         <div className="container-fluid">
            <div className="row">
               <div className="col-sm-6 col-md-4"><a id="btn-login" href="https://www.afprojects.com/x-2016/nft-web-x/index-as10k.html"><img src="images/logo.png" width="130"/></a>
                  <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
                  </button>
               </div>
               <div className="col-sm-6 col-md-4">
                  <div id="searchbox" className="ais-SearchBox"></div>
               </div>
               <div className="col-sm-12 col-md-4"></div>
            </div>
         </div>
      </header>

      <br />
      <div className="grid place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-12">
        <ConnectWallet />
        <Buy />
        <List orders={orders} />
        <Cancel orders={orders} />
      </div>
      <p className="mb-4">
        This demo is using the{' '}
        <a
          className="underline"
          target="_blank"
          href="https://www.reservoir.fun/collections/0x4d68e14cd7dec510c84326f54ee41f88e8fad59b"
          rel="norefereer noopener"
        >
          Reservoir 721
        </a>{' '}
        and{' '}
        <a
          className="underline"
          target="_blank"
          href="https://www.reservoir.fun/collections/0xfb8695dc919078c37fe507b800e2c33ed3d815d8"
          rel="norefereer noopener"
        >
          Reservoir 1155
        </a>{' '}
        collections on Rinkeby.
      </p>
      {userAddress && (
        <p>
          View your Rinkeby orders on{' '}
          <a
            className="underline"
            target="_blank"
            href={`https://www.reservoir.fun/address/${userAddress}`}
          >
            Reservoir Market Testnet
          </a>
          .
        </p>
      )}
    </Layout>
  )
}

export default IndexPage
