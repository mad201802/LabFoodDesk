import { type Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { type AppType } from "next/app"

import { api } from "~/utils/api"

import Head from "next/head"
import Layout from "~/components/Layout/Layout"
import "~/styles/globals.css"
import { ThemeProvider } from "~/components/Layout/ThemeProvider"

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Layout>
          <Head>
            <title>LabEats</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  )
}

export default api.withTRPC(MyApp)
